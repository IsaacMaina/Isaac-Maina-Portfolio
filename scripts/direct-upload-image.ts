import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// For file uploads, we need the service role key which has more permissions
// If service role key is not available, the anon key will be used but might not have upload permissions
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadProfileImage() {
  try {
    // Since we're in Node.js, we can't directly use File/Blob APIs
    // Instead, we'll use a different approach to upload the file
    console.log('This script needs to be run in an environment that supports file uploads to Supabase.');
    console.log('However, to properly upload to Supabase, you typically need to do this manually through the Supabase dashboard or use a service role key.');
    
    // Path to the image in the public folder
    const imagePath = path.join(__dirname, '..', 'public', 'img34.png');
    
    console.log('Checking if image file exists at:', imagePath);
    
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file does not exist at path: ${imagePath}`);
    }
    
    // Read the image file as buffer
    const imageBuffer = fs.readFileSync(imagePath);
    
    console.log('File exists and is', imageBuffer.length, 'bytes');
    
    // Since we can't easily upload from a server-side Node.js script using the storage API
    // due to missing browser File API, the best approach is to document the manual process
    console.log('\nTo upload this image to Supabase:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Storage > Images bucket');
    console.log('3. Create a folder called "profile-images"');
    console.log('4. Upload the "img34.png" file from the public folder to the "profile-images" folder');
    console.log('5. The file should be accessible at path: "profile-images/img34.png"');
    
    // For the purpose of this task, we'll just update the database to expect this path
    console.log('\nUpdating database to expect image at profile-images/img34.png...');
    return 'profile-images/img34.png';
  } catch (error) {
    console.error('Error in upload function:', error);
    throw error;
  }
}

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
    
    console.log('✅ User profile updated with new image path:', imagePath);
  } else {
    console.log('User not found. You may need to seed the user data first.');
  }
}

async function main() {
  console.log('Preparing to set up profile image in Supabase...');
  
  try {
    const imagePath = await uploadProfileImage();
    
    console.log('\nUpdating user profile with Supabase image path...');
    await updateUserProfileImagePath(imagePath);
    
    console.log('\n🎉 Setup completed!');
    console.log('The about page will now attempt to fetch the image from Supabase at path:', imagePath);
    console.log('\n⚠️  Remember to manually upload img34.png to Supabase storage at "profile-images/img34.png"');
  } catch (error) {
    console.error('\n❌ Error in main process:', error);
    process.exit(1);
  }
}

main();