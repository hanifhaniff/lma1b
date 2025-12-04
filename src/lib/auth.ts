import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createToken as createJWT, verifyToken as verifyJWT } from './auth-edge';

const COOKIE_NAME = 'auth-token';

export type AuthUser = {
  id: number;
  username: string;
  email: string | null;
  name: string | null;
};

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export async function createToken(user: AuthUser): Promise<string> {
  return createJWT({ id: user.id, username: user.username });
}

// Verify JWT token
export async function verifyToken(token: string): Promise<{ id: number; username: string } | null> {
  return verifyJWT(token);
}

// Get current user from cookie
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      name: users.name,
    }).from(users).where(eq(users.id, payload.id));

    return user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Login user
export async function loginUser(username: string, password: string): Promise<AuthUser | null> {
  try {
    const [user] = await db.select().from(users).where(eq(users.username, username));

    if (!user) {
      return null;
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return null;
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
    };

    const token = await createToken(authUser);
    await setAuthCookie(token);

    return authUser;
  } catch (error) {
    console.error('Error logging in user:', error);
    return null;
  }
}

// Register user
export async function registerUser(username: string, password: string, email?: string, name?: string): Promise<AuthUser | null> {
  try {
    const hashedPassword = await hashPassword(password);
    
    const [newUser] = await db.insert(users).values({
      username,
      password: hashedPassword,
      email: email || null,
      name: name || null,
    }).$returningId();

    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      name: users.name,
    }).from(users).where(eq(users.id, newUser.id));

    if (!user) {
      return null;
    }

    const token = await createToken(user);
    await setAuthCookie(token);

    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
}

// Logout user
export async function logoutUser() {
  await clearAuthCookie();
}

// Require auth (throws if not authenticated)
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
