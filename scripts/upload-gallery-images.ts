// scripts/upload-gallery-images.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables - specify the .env.local file with absolute path
require('dotenv').config({ path: '../.env.local' });

// Also try loading from different possible locations to debug
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log("Failed to load .env.local from '../.env.local'");
  console.log("Attempting to load from current directory...");
  require('dotenv').config({ path: '.env.local' });
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log("Attempting to load from parent directory...");
  require('dotenv').config({ path: '../.env.local' });
}

async function uploadGalleryImages() {
  console.log('Starting gallery image upload to Supabase in categorized subfolders...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for uploads

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables. Please check your .env.local file.');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '[HIDDEN]' : 'MISSING');
    return;
  }

  // Initialize Supabase client with service role key for administrative operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get all image files that start with 'img' and have image extensions
  const publicDir = path.join(__dirname, '..', 'public');
  const imageFiles = fs.readdirSync(publicDir).filter(file =>
    file.toLowerCase().startsWith('img') &&
    /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
  );

  // Categories for images
  const categories = ['work', 'events', 'personal'];

  for (const imageName of imageFiles) {
    try {
      console.log(`Uploading ${imageName}...`);

      // Read the image file from the public directory
      const imagePath = path.join(publicDir, imageName);

      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        console.log(`File does not exist: ${imagePath}`);
        continue;
      }

      // Randomly assign a category (except 'all' since that's just a filter)
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      // Create the path with category subfolder
      const supabasePath = `gallery/${randomCategory}/${imageName}`;

      const fileContent = fs.readFileSync(imagePath);

      // Upload to Supabase storage in the gallery folder with category subfolders
      const { data, error } = await supabase.storage
        .from('Images') // Using the same bucket as profile images
        .upload(supabasePath, fileContent, {
          cacheControl: '3600',
          upsert: true // Overwrite if exists
        });

      if (error) {
        console.error(`Error uploading ${imageName} to ${supabasePath}:`, error.message);
        continue;
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('Images')
        .getPublicUrl(supabasePath);

      console.log(`${imageName} uploaded successfully to category '${randomCategory}'! Public URL:`, publicUrlData?.publicUrl);
    } catch (error: any) {
      console.error(`Failed to upload ${imageName}:`, error.message);
    }
  }

  console.log('Gallery image upload process completed.');
}

// Run the function and handle errors
uploadGalleryImages().catch(console.error);