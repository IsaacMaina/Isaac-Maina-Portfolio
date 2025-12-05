import { neon } from '@neondatabase/serverless';

async function checkTables() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Query to get all table names from the database
    const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables in the database:', result);

    // Check if user_profiles exists specifically
    const userProfilesResult = await sql`SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
    )`;
    console.log('user_profiles table exists:', userProfilesResult[0].exists);

  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();