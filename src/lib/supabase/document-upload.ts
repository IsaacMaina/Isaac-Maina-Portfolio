// Helper function for document upload
import { createClient } from '@supabase/supabase-js';

export async function uploadDocumentToSupabase(file: File, category: string = 'documents') {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return { success: false, url: null, error: 'Missing Supabase configuration' };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Sanitize the category to avoid file path manipulation
    const sanitizedCategory = category.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() || 'uncategorized';

    // Create a unique name for the file
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    // Store documents in the documents folder, then in the specific category subfolder
    const filePath = `documents/${sanitizedCategory}/${fileName}`;

    // Upload the file to Supabase storage in the category folder
    // Using the same bucket as images ('Images')
    const { data, error } = await supabase.storage
      .from('Images') // Using the same bucket as images
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Overwrite if exists
      });

    if (error) {
      console.error('Error uploading document to Supabase:', error);
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
    console.error('Unexpected error uploading document:', error);
    return { success: false, url: null, error: error.message };
  }
}