// Helper function for gallery image upload
import { createClient } from '@supabase/supabase-js';

export async function uploadGalleryImageToSupabase(file: File, category: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return { success: false, url: null, error: 'Missing Supabase configuration' };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Create a unique name for the file
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `gallery/${category}/${fileName}`;

    // Upload the file to Supabase storage in the category folder
    const { data, error } = await supabase.storage
      .from('Images') // Using the Images bucket
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Overwrite if exists
      });

    if (error) {
      console.error('Error uploading image to Supabase:', error);
      return { success: false, url: null, error: error.message };
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('Images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData?.publicUrl || null,
      path: filePath
    };
  } catch (error: any) {
    console.error('Unexpected error uploading image:', error);
    return { success: false, url: null, error: error.message };
  }
}