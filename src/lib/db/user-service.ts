import { getDb } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcryptjs from 'bcryptjs';

const db = getDb();

// Get all users (admin only)
export async function getAllUsers() {
  try {
    const userResults = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);

    return userResults;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: number) {
  try {
    const userResults = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    return userResults.length > 0 ? userResults[0] : null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}

// Update user's email
export async function updateUserEmail(userId: number, newEmail: string) {
  try {
    const updatedUsers = await db
      .update(users)
      .set({ 
        email: newEmail,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUsers.length > 0 ? updatedUsers[0] : null;
  } catch (error) {
    console.error('Error updating user email:', error);
    throw error;
  }
}

// Update user's password
export async function updateUserPassword(userId: number, newPassword: string) {
  try {
    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    const updatedUsers = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUsers.length > 0 ? updatedUsers[0] : null;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
}

// Update user's name
export async function updateUserName(userId: number, newName: string) {
  try {
    const updatedUsers = await db
      .update(users)
      .set({ 
        name: newName,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return updatedUsers.length > 0 ? updatedUsers[0] : null;
  } catch (error) {
    console.error('Error updating user name:', error);
    throw error;
  }
}

// Delete user (admin only)
export async function deleteUser(userId: number) {
  try {
    const deletedUsers = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return deletedUsers.length > 0 ? deletedUsers[0] : null;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}