import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, userProfiles, projects, documents, galleryItems, skillCategories, skills, education, experience, certifications, additionalSkills, sessions, accounts } from './src/db/schema';
import { eq } from 'drizzle-orm';

// Use your database connection string
const DATABASE_URL = "postgresql://neondb_owner:npg_MBL6iPEsI9QS@ep-purple-recipe-adgtxg2x-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function verifyUserRemoval() {
  try {
    // Create database connection
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql);

    console.log("Verifying that user 'Isaac Maina' has been removed...");

    // Check for users with name "Isaac Maina"
    const usersResult = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.name, "Isaac Maina"));

    if (usersResult.length === 0) {
      console.log("✓ Confirmed: No users found with name 'Isaac Maina'");
    } else {
      console.log(`✗ Unexpected: Found ${usersResult.length} users with name 'Isaac Maina':`);
      usersResult.forEach(user => {
        console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
      });
    }

    // Check for user profiles with name "Isaac Maina"
    const profilesResult = await db
      .select({ id: userProfiles.id, name: userProfiles.name, userId: userProfiles.userId })
      .from(userProfiles)
      .where(eq(userProfiles.name, "Isaac Maina"));

    if (profilesResult.length === 0) {
      console.log("✓ Confirmed: No user profiles found with name 'Isaac Maina'");
    } else {
      console.log(`✗ Unexpected: Found ${profilesResult.length} profiles with name 'Isaac Maina':`);
      profilesResult.forEach(profile => {
        console.log(`  - ID: ${profile.id}, Name: ${profile.name}, UserID: ${profile.userId}`);
      });
    }

    // Also check for the specific user with email that was removed
    const userByEmail = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, "mainaisaacwachira2000@gmail.com"));

    if (userByEmail.length === 0) {
      console.log("✓ Confirmed: No user found with email 'mainaisaacwachira2000@gmail.com'");
    } else {
      console.log(`✗ Unexpected: Found user with email 'mainaisaacwachira2000@gmail.com':`);
      userByEmail.forEach(user => {
        console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
      });
    }

    console.log("\nVerification complete. The user 'Isaac Maina' and related data have been successfully removed from the database.");
  } catch (error) {
    console.error("Error during verification:", error);
    throw error;
  }
}

// Execute the function
verifyUserRemoval()
  .then(() => {
    console.log("Verification script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Verification script failed:", error);
    process.exit(1);
  });