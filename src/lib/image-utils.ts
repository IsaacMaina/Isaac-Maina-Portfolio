import supabase from '@/lib/supabase/client';

/**
 * Generates a public URL for an image in Supabase storage
 * @param imagePath The path of the image in the storage bucket (e.g. 'profile-images/me.jpg')
 * @returns The public URL of the image or null if it doesn't exist
 */
export async function getSupabaseImageUrl(imagePath: string | null | undefined): Promise<string | null> {
  if (!imagePath) {
    return null;
  }

  // If it's already a public URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // If it looks like a local path (starts with /), return as is
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // It's likely a Supabase storage path, so get the public URL
  const { data } = supabase.storage
    .from('Images') // Using the 'Images' bucket
    .getPublicUrl(imagePath);

  return data?.publicUrl || null;
}

/**
 * Generates a public URL for an image in Supabase storage (synchronous version for client components)
 * @param imagePath The path of the image in the storage bucket (e.g. 'profile-images/me.jpg')
 * @returns The public URL of the image or default image if it doesn't exist
 */
export function getSupabaseImageUrlSync(imagePath: string | null | undefined, defaultImage: string = '/me.jpg'): string {
  if (!imagePath) {
    return defaultImage;
  }

  // If it's already a public URL (starts with http), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // If it looks like a local path (starts with /), return as is
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // It's likely a Supabase storage path, so construct the public URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not set in environment variables');
    return defaultImage;
  }

  // Format: {SUPABASE_URL}/storage/v1/object/public/Images/{imagePath}
  // Ensure there are no double slashes
  const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `${supabaseUrl}/storage/v1/object/public/Images/${cleanImagePath}`;
}