// scripts/create-admin-user.ts
import { getDb } from '@/lib/db-connector';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function createAdminUser() {
  try {
    // Get database instance
    const db = getDb();

    const hashedPassword = await bcrypt.hash('admin123', 10);

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

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();