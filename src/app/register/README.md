# User Management / Register Page

## Overview
Halaman untuk manajemen user: mendaftarkan user baru, edit user, dan hapus user. Hanya user yang sudah login yang bisa mengakses halaman ini.

## Fitur

### 1. **List Users**
- Menampilkan semua user yang terdaftar
- Kolom: No, Username, Name, Email, Created At, Actions
- Pagination (akan ditambahkan jika diperlukan)

### 2. **Search Users**
- Search by username, email, atau name
- Real-time filtering

### 3. **Register/Create User**
- Form untuk membuat user baru
- Fields:
  - Username (required, min 3 characters, unique)
  - Password (required, min 6 characters)
  - Email (optional, harus format email valid)
  - Full Name (optional)
- Validasi:
  - Username harus unique
  - Password minimal 6 karakter
  - Email format validation
  
### 4. **Edit User**
- Update email dan name
- Update password (optional, kosongkan jika tidak ingin ganti)
- Username tidak bisa diubah

### 5. **Delete User**
- Hapus user dengan konfirmasi
- Tidak bisa menghapus diri sendiri (bisa ditambahkan validasi)

## File Structure

```
src/app/register/
├── page.tsx              # Main page component (client)
├── layout.tsx            # Layout wrapper
├── types.ts              # TypeScript interfaces
├── actions.ts            # Server actions (CRUD)
├── user-form.tsx         # Form component (create/edit)
├── user-table.tsx        # Table component
├── confirm-dialog.tsx    # Delete confirmation dialog
└── README.md             # Documentation
```

## Tech Stack

- **Next.js 15** with App Router
- **Server Actions** untuk CRUD operations
- **Drizzle ORM** untuk database queries
- **Shadcn UI** untuk UI components
- **Bcrypt** untuk password hashing
- **Zod** untuk validation (optional, bisa ditambahkan)

## Database Schema

Table: `users`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INT | No | AUTO_INCREMENT | Primary key |
| username | VARCHAR(255) | No | - | Unique username |
| password | VARCHAR(255) | No | - | Hashed password |
| email | VARCHAR(255) | Yes | NULL | User email |
| name | VARCHAR(255) | Yes | NULL | Full name |
| created_at | TIMESTAMP | Yes | CURRENT_TIMESTAMP | Creation time |

## Security

### 1. **Authentication Required**
- Route dilindungi oleh middleware
- Hanya user yang login bisa akses halaman ini

### 2. **Password Hashing**
- Password di-hash menggunakan bcrypt
- Password tidak pernah disimpan dalam plaintext

### 3. **Input Validation**
- Server-side validation untuk semua input
- Client-side validation untuk UX yang lebih baik

### 4. **Authorization**
- Saat ini semua user yang login bisa manage users
- Bisa ditambahkan role-based access control (admin only)

## Usage

### Access the Page
```
http://localhost:3000/register
```

### Register New User
1. Click "Register User" button
2. Fill in the form:
   - Username (required)
   - Password (required)
   - Email (optional)
   - Name (optional)
3. Click "Create User"

### Edit User
1. Click ⋮ (three dots) pada user yang ingin diedit
2. Click "Edit"
3. Update fields yang ingin diubah
4. Kosongkan password jika tidak ingin mengubahnya
5. Click "Update User"

### Delete User
1. Click ⋮ (three dots) pada user yang ingin dihapus
2. Click "Delete"
3. Confirm deletion

### Search Users
1. Type di search box untuk filter by username, email, atau name
2. Results akan di-filter secara real-time

## API / Server Actions

### `getUsers(searchTerm?: string): Promise<User[]>`
Fetch all users dengan optional search.

### `getUserById(id: number): Promise<User | null>`
Fetch single user by ID.

### `createUser(data: UserFormData): Promise<User>`
Create new user dengan password hashing.

### `updateUser(id: number, data: UpdateUserData): Promise<User>`
Update user info. Password hanya di-update jika provided.

### `deleteUser(id: number): Promise<void>`
Delete user by ID.

### `checkUsernameExists(username: string, excludeId?: number): Promise<boolean>`
Check if username sudah dipakai.

## Future Enhancements

### 1. **Role-Based Access Control**
```typescript
// Add role field to users table
role: 'admin' | 'user'

// Only admins can manage users
if (currentUser.role !== 'admin') {
  throw new Error('Unauthorized');
}
```

### 2. **Prevent Self-Deletion**
```typescript
export async function deleteUser(id: number, currentUserId: number) {
  if (id === currentUserId) {
    throw new Error('Cannot delete your own account');
  }
  // ... delete logic
}
```

### 3. **Password Strength Indicator**
Add visual indicator untuk password strength.

### 4. **Email Verification**
Send verification email saat create user baru.

### 5. **Audit Log**
Track siapa yang create/update/delete user dan kapan.

### 6. **Bulk Actions**
Select multiple users untuk bulk delete atau bulk update.

### 7. **User Status**
Add active/inactive status untuk users.

### 8. **Last Login Tracking**
Track last login time untuk setiap user.

## Testing

### Manual Testing Checklist

- [ ] Can access /register when logged in
- [ ] Cannot access /register when not logged in (redirect to /login)
- [ ] Can create new user with valid data
- [ ] Cannot create user dengan username yang sudah ada
- [ ] Password validation works (min 6 characters)
- [ ] Email validation works
- [ ] Can edit user and update email/name
- [ ] Can update password saat edit
- [ ] Password field can be left empty saat edit (keeps old password)
- [ ] Can delete user with confirmation
- [ ] Search functionality works
- [ ] Table displays correctly
- [ ] Form validation works
- [ ] Success/error messages display correctly

## Troubleshooting

### Issue: Cannot create user
**Solution:** Check if username already exists. Username must be unique.

### Issue: Password too short error
**Solution:** Password must be at least 6 characters.

### Issue: Page shows "Access Denied"
**Solution:** Make sure you're logged in. Go to /login first.

### Issue: Changes not reflected after create/update
**Solution:** Page should auto-refresh. If not, click the Refresh button.

## Related Files

- **Middleware:** `src/middleware.ts` (protects /register route)
- **Auth Context:** `src/lib/auth-context.tsx`
- **Auth Functions:** `src/lib/auth.ts`
- **Database Schema:** `src/lib/db/schema.ts`
- **Navbar:** `src/app/dashboard/navbar.tsx` (contains link to /register)
