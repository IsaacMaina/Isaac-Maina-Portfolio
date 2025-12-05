import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

// Create connection to database
const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient);

async function migrate() {
  try {
    console.log('Running migration to add name column to user_profiles table...');

    // Add the name column to the user_profiles table if it doesn't exist
    await db.execute(sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS name VARCHAR(255);`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();