// test-env.ts - Test if environment variables are loaded
import { db } from '@/db';

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('NEXTAUTH_URL exists:', !!process.env.NEXTAUTH_URL);

try {
  console.log('Database connection object created successfully');
  console.log('db object type:', typeof db);
} catch (error) {
  console.error('Error creating database connection:', error);
}