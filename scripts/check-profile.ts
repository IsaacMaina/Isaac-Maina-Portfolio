import { config } from 'dotenv';
config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, userProfiles } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function checkProfileImage() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  // Find the user (assuming Isaac Maina is the user)
  const existingUser = await db.select().from(users).where(eq(users.email, 'mainaisaacwachira2000@gmail.com'));
  
  if (existingUser.length > 0) {
    const userId = existingUser[0].id;
    
    // Get the user profile
    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    
    if (profile.length > 0) {
      console.log('✅ User profile found:');
      console.log('User ID:', userId);
      console.log('User Email:', existingUser[0].email);
      console.log('Profile Image Path:', profile[0].image);
      console.log('Profile Title:', profile[0].title);
    } else {
      console.log('❌ No profile found for user');
    }
  } else {
    console.log('❌ User not found. You may need to seed the user data first.');
  }
}

checkProfileImage().catch(console.error);