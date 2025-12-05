import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase environment variables are not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Categories for images (excluding 'all' since that's just a filter, not a real category)
const categories = ['work', 'events', 'personal'];

async function seedGalleryImages() {
  try {
    console.log('Starting gallery image seeding process...');

    // Get all image files from the public directory
    const publicDir = path.join(process.cwd(), 'public');
    const imageFiles = fs.readdirSync(publicDir).filter(file =>
      file.toLowerCase().startsWith('img') &&
      /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} image files to upload`);

    for (const imageFile of imageFiles) {
      // Randomly assign a category
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];

      // Create the full Supabase path
      const filePath = `gallery/${randomCategory}/${imageFile}`;

      // Read the file
      const fullPath = path.join(publicDir, imageFile);

      console.log(`Uploading ${imageFile} to ${filePath}...`);

      // Read file as buffer and convert to Blob for browser compatibility
      const fileBuffer = fs.readFileSync(fullPath);
      const fileBlob = new Blob([fileBuffer]);

      // Create a File object from the blob
      const file = new File([fileBlob], imageFile, { type: fileBlob.type || 'image/png' });

      // Upload to Supabase storage
      const { data, error } = await supabase
        .storage
        .from('Images') // Use the 'Images' bucket
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Replace if file exists
        });

      if (error) {
        console.error(`Error uploading ${imageFile}:`, error);
      } else {
        console.log(`Successfully uploaded ${imageFile} to ${filePath}`);
      }
    }

    console.log('Gallery image seeding process completed!');
  } catch (error) {
    console.error('Error during gallery image seeding:', error);
    process.exit(1);
  }
}

// Execute the function
seedGalleryImages()
  .then(() => {
    console.log('Gallery image seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Gallery image seeding failed:', error);
    process.exit(1);
  });