// scripts/create-admin-user.ts
// This script creates an admin user in the database
// IMPORTANT: Use a strong, unique password and store it securely
import { getDb } from '@/lib/db-connector';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function createAdminUser() {
  try {
    // Get database instance
    const db = getDb();

    // Get password from environment variable for security
    const adminPassword = process.env.ADMIN_PASSWORD ||
                         process.env.ADMIN_DEFAULT_PASSWORD ||
                         process.env.NEXTAUTH_SECRET?.substring(0, 12) ||
                         Math.random().toString(36).substring(2, 15) + '!Aa';

    console.log('Creating admin user with secure password from environment or generated default');

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@example.com'));

    if (existingAdmin.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    await db.insert(users).values({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin user created successfully with secure password');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();