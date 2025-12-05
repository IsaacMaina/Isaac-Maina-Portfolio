import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, userProfiles, projects, documents, galleryItems, skillCategories, skills, education, experience, certifications, additionalSkills, sessions, accounts } from './src/db/schema';
import { eq } from 'drizzle-orm';

// Use your database connection string
const DATABASE_URL = "postgresql://neondb_owner:npg_MBL6iPEsI9QS@ep-purple-recipe-adgtxg2x-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function removeUserAndRelatedData() {
  try {
    // Create database connection
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql);

    console.log("Connecting to database and starting user removal process...");

    // Find the user with name "Isaac Maina" in the users table
    console.log("Searching for users with name 'Isaac Maina'...");
    let usersResult = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.name, "Isaac Maina"));

    if (usersResult.length === 0) {
      console.log("No user found with name 'Isaac Maina' in the users table.");
    } else {
      for (const user of usersResult) {
        console.log(`Found user: ${user.name} (Email: ${user.email}, ID: ${user.id})`);

        // Delete associated accounts
        await db.delete(accounts).where(eq(accounts.userId, user.id));
        console.log(`Deleted associated accounts for user ID: ${user.id}`);

        // Delete associated sessions
        await db.delete(sessions).where(eq(sessions.userId, user.id));
        console.log(`Deleted associated sessions for user ID: ${user.id}`);

        // Delete the user profile associated with this user
        await db.delete(userProfiles).where(eq(userProfiles.userId, user.id));
        console.log(`Deleted user profile for user ID: ${user.id}`);

        // Finally, delete the user
        await db.delete(users).where(eq(users.id, user.id));
        console.log(`Deleted user: ${user.name} (ID: ${user.id})`);
      }
    }

    // Also look for any profiles with Isaac Maina's name in userProfiles table (independent of user account)
    console.log("Searching for user profiles with name 'Isaac Maina'...");
    const profilesByName = await db
      .select({ id: userProfiles.id, name: userProfiles.name, userId: userProfiles.userId })
      .from(userProfiles)
      .where(eq(userProfiles.name, "Isaac Maina"));

    if (profilesByName.length > 0) {
      for (const profile of profilesByName) {
        console.log(`Found profile with name 'Isaac Maina' (Profile ID: ${profile.id})`);

        // Delete the profile
        await db.delete(userProfiles).where(eq(userProfiles.id, profile.id));

        // If the profile was linked to a user, delete that user too
        if (profile.userId) {
          await db.delete(accounts).where(eq(accounts.userId, profile.userId));
          await db.delete(sessions).where(eq(sessions.userId, profile.userId));
          await db.delete(users).where(eq(users.id, profile.userId));
          console.log(`Deleted associated user data for User ID: ${profile.userId}`);
        }

        console.log(`Deleted profile: ${profile.name} (ID: ${profile.id})`);
      }
    } else {
      console.log("No user profiles found with name 'Isaac Maina'.");
    }

    console.log("User removal process completed successfully.");
  } catch (error) {
    console.error("Error during user removal:", error);
    throw error;
  }
}

// Execute the function
removeUserAndRelatedData()
  .then(() => {
    console.log("Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });