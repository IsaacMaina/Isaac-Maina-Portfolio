import { config } from 'dotenv';
config({ path: '.env.local' });

// Function to update the user profile with the Supabase image path
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, userProfiles } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function updateUserProfileImagePath(imagePath: string) {
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

    // Update the user profile with the new image path
    await db.update(userProfiles)
      .set({
        image: imagePath
      })
      .where(eq(userProfiles.userId, userId));

    console.log('User profile updated with new image path:', imagePath);
  } else {
    console.log('User not found. You may need to seed the user data first.');
  }
}

console.log(`
===============================================
MANUAL SUPABASE IMAGE UPLOAD INSTRUCTIONS
===============================================

To use 'img34.png' from the public folder with Supabase:

1. Go to your Supabase dashboard
2. Navigate to Storage > Images bucket
3. Create a folder called 'profile-images'
4. Upload the 'img34.png' file from the public folder to the 'profile-images' folder
5. The file should be accessible at path: 'profile-images/img34.png'

After uploading the image to Supabase, run this script to update the database:

npm run update:profile-path

This will update the database record to point to the Supabase-stored image.
`);

async function main() {
  console.log('Preparing to update user profile with Supabase image path...');

  // Use the path where the image will be stored in Supabase
  const imagePath = 'profile-images/img34.png';
  console.log('Setting image path to:', imagePath);

  console.log('Updating user profile with Supabase image path...');
  await updateUserProfileImagePath(imagePath);

  console.log(`
Profile image path updated successfully!
The about page will now fetch the image from Supabase at path: ${imagePath}

To see the changes:
1. Make sure you've uploaded img34.png to Supabase storage at 'profile-images/img34.png'
2. Restart your development server if it's running
3. Visit the /about page
`);
}

main().catch((error) => {
  console.error('Error in main process:', error);
  process.exit(1);
});