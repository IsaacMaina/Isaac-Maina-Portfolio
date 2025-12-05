import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { count } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection by counting records
    const profileCount = await db.select({ count: count() }).from(userProfiles);
    console.log('Profile count query successful:', profileCount);
    
    // Test with limit
    const profileWithLimit = await db.select().from(userProfiles).limit(1);
    console.log('Profile with limit query successful:', profileWithLimit);
    
    console.log('Database connection and queries working correctly!');
  } catch (error) {
    console.error('Error testing database connection:', error);
  }
}

testConnection();