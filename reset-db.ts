import { neon } from '@neondatabase/serverless';

async function resetDatabase() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Drop all old tables that are preventing the new migration
    try {
      await sql`DROP TABLE IF EXISTS "verificationTokens" CASCADE`;
      console.log('Dropped verificationTokens table');
    } catch (e) {
      console.log('Could not drop verificationTokens:', e.message);
    }

    try {
      await sql`DROP TABLE IF EXISTS "career_documents" CASCADE`;
      console.log('Dropped career_documents table');
    } catch (e) {
      console.log('Could not drop career_documents:', e.message);
    }

    try {
      await sql`DROP TABLE IF EXISTS "career_categories" CASCADE`;
      console.log('Dropped career_categories table');
    } catch (e) {
      console.log('Could not drop career_categories:', e.message);
    }

    try {
      await sql`DROP TABLE IF EXISTS "tattoo_posts" CASCADE`;
      console.log('Dropped tattoo_posts table');
    } catch (e) {
      console.log('Could not drop tattoo_posts:', e.message);
    }

    try {
      await sql`DROP TABLE IF EXISTS "website_links" CASCADE`;
      console.log('Dropped website_links table');
    } catch (e) {
      console.log('Could not drop website_links:', e.message);
    }

    try {
      await sql`DROP TABLE IF EXISTS "user_credentials" CASCADE`;
      console.log('Dropped user_credentials table');
    } catch (e) {
      console.log('Could not drop user_credentials:', e.message);
    }

    console.log('Database reset completed. Now run `npx drizzle-kit migrate` to create new tables.');

  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

resetDatabase();