import { neon } from '@neondatabase/serverless';

async function dropRemainingTables() {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    await sql`DROP TABLE IF EXISTS "accounts" CASCADE`;
    console.log('Dropped accounts table');
    await sql`DROP TABLE IF EXISTS "sessions" CASCADE`;
    console.log('Dropped sessions table');
    await sql`DROP TABLE IF EXISTS "users" CASCADE`;
    console.log('Dropped users table');
    console.log('All old tables dropped');
  } catch (e) {
    console.error('Error:', e);
  }
}

dropRemainingTables();