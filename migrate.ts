import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { userRoleEnum } from './src/db/schema';
import { sql } from 'drizzle-orm';

// Create connection to database
const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient);

async function migrate() {
  try {
    console.log('Running migration to add role column to users table...');
    
    // Add the user_role enum type if it doesn't exist
    await db.execute(sql`DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('admin', 'user', 'manager', 'viewer');
        END IF;
      END
    $$;`);
    
    // Add the role column to the users table if it doesn't exist
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;`);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();