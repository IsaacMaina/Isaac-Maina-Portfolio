// scripts/simple-upload.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// For this script, we'll directly use the values from .env.local
// You need to update these with your actual Supabase credentials
const supabase = createClient(
  'https://fsoevobqzmjhjhkpwfgb.supabase.co', // Replace with your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2V2b2Jxem1qaGpoa3B3ZmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMDUyNzQsImV4cCI6MjA3OTg4MTI3NH0.25zRPRnCGrTzMhupuSfLpzF8kVjVzyYexlhl7s5KRgE' // Replace with your anon key
);

async function uploadGalleryImages() {
  console.log('Starting gallery image upload to Supabase...');
  
  // Array of image names to upload
  const imageNames = Array.from({ length: 14 }, (_, i) => `img${i + 1}.png`);
  
  for (const imageName of imageNames) {
    try {
      console.log(`Uploading ${imageName}...`);
      
      // Read the image file from the public directory
      const imagePath = path.join(__dirname, '..', 'public', imageName);
      
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        console.log(`File does not exist: ${imagePath}`);
        continue;
      }
      
      const fileContent = fs.readFileSync(imagePath);
      
      // Upload to Supabase storage in the gallery folder
      const { data, error } = await supabase.storage
        .from('Images') // Using your Images bucket
        .upload(`gallery/${imageName}`, fileContent, {
          cacheControl: '3600',
          upsert: true // Overwrite if exists
        });
      
      if (error) {
        console.error(`Error uploading ${imageName}:`, error.message);
        continue;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('Images')
        .getPublicUrl(`gallery/${imageName}`);
      
      console.log(`${imageName} uploaded successfully! Public URL:`, publicUrlData?.publicUrl);
    } catch (error: any) {
      console.error(`Failed to upload ${imageName}:`, error.message);
    }
  }
  
  console.log('Gallery image upload process completed.');
}

// Run the function and handle errors
uploadGalleryImages().catch(console.error);