'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, desc, or, like } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import { User, UserFormData, UpdateUserData } from './types';

// Fetch all users
export async function getUsers(searchTerm?: string): Promise<User[]> {
  try {
    let data;
    
    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      data = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        created_at: users.createdAt,
      }).from(users)
        .where(
          or(
            like(users.username, searchPattern),
            like(users.email, searchPattern),
            like(users.name, searchPattern)
          )
        )
        .orderBy(desc(users.createdAt));
    } else {
      data = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        created_at: users.createdAt,
      }).from(users).orderBy(desc(users.createdAt));
    }
    
    return data.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      name: u.name,
      created_at: u.created_at || new Date(),
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Get single user by id
export async function getUserById(id: number): Promise<User | null> {
  try {
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      name: users.name,
      created_at: users.createdAt,
    }).from(users).where(eq(users.id, id)).limit(1);
    
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      created_at: user.created_at || new Date(),
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Check if username already exists
export async function checkUsernameExists(username: string, excludeId?: number): Promise<boolean> {
  try {
    let query = db.select({ id: users.id }).from(users).where(eq(users.username, username));
    
    const results = await query.limit(1);
    
    // If updating, exclude current user
    if (excludeId && results.length > 0 && results[0].id === excludeId) {
      return false;
    }
    
    return results.length > 0;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
}

// Create new user
export async function createUser(data: UserFormData): Promise<User> {
  try {
    // Check if username already exists
    const exists = await checkUsernameExists(data.username);
    if (exists) {
      throw new Error('Username already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(data.password);
    
    // Insert user
    const [newUser] = await db.insert(users).values({
      username: data.username,
      password: hashedPassword,
      email: data.email || null,
      name: data.name || null,
    }).$returningId();
    
    // Fetch created user
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      name: users.name,
      created_at: users.createdAt,
    }).from(users).where(eq(users.id, newUser.id));
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      created_at: user.created_at || new Date(),
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user
export async function updateUser(id: number, data: UpdateUserData): Promise<User> {
  try {
    const updateValues: any = {};
    
    if (data.email !== undefined) updateValues.email = data.email || null;
    if (data.name !== undefined) updateValues.name = data.name || null;
    if (data.password) {
      updateValues.password = await hashPassword(data.password);
    }
    
    await db.update(users).set(updateValues).where(eq(users.id, id));
    
    const [user] = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      name: users.name,
      created_at: users.createdAt,
    }).from(users).where(eq(users.id, id));
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      created_at: user.created_at || new Date(),
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Delete user
export async function deleteUser(id: number): Promise<void> {
  try {
    await db.delete(users).where(eq(users.id, id));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
