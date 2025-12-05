import supabase from '@/lib/supabase/client';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImageToSupabase(
  file: File, 
  folder: string = 'profile-images',
  userId: string
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
      };
    }

    // Validate file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      };
    }

    // Create a unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';

    // For gallery images, organize by category if provided in the folder parameter
    // Format: gallery/categoryName/filename
    let fileName: string;
    if (folder === 'gallery') {
      // If the folder parameter is 'gallery', use the default gallery path
      fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    } else if (folder.startsWith('gallery/')) {
      // If folder already includes a subfolder like 'gallery/certificates', use it
      fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    } else if (folder === 'profile-images' || folder.includes('profile-images')) {
      // For profile images, use the original path structure if userId is provided, otherwise store directly in folder
      if (userId) {
        fileName = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
      } else {
        fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
      }
    } else {
      // For other generic folders, use new path structure
      fileName = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    }
    
    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from('Images') // Using the 'Images' bucket
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('Images')
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      return {
        success: false,
        error: 'Could not generate public URL for the uploaded image'
      };
    }

    return {
      success: true,
      url: publicUrlData.publicUrl
    };
  } catch (error: any) {
    console.error('Unexpected error during upload:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during upload'
    };
  }
}

// Function to delete an image from Supabase storage
export async function deleteImageFromSupabase(imageUrl: string): Promise<boolean> {
  try {
    // Extract the file path from the public URL
    const pathStart = imageUrl.indexOf('/storage/v1/object/public/Images/') + 33;
    if (pathStart === -1) {
      console.error('Invalid Supabase image URL');
      return false;
    }

    const filePath = imageUrl.substring(pathStart);

    const { error } = await supabase.storage
      .from('Images')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

// Function to list all images for a user
export async function listUserImages(userId: string, folder: string = 'profile-images') {
  try {
    const { data, error } = await supabase.storage
      .from('Images')
      .list(`${folder}/${userId}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('List error:', error);
      return [];
    }

    return data.map(item => {
      const { data: publicUrlData } = supabase.storage
        .from('Images')
        .getPublicUrl(`${folder}/${userId}/${item.name}`);
      
      return {
        ...item,
        publicUrl: publicUrlData?.publicUrl
      };
    });
  } catch (error) {
    console.error('Error listing images:', error);
    return [];
  }
}

// Function to upload gallery images organized by category
export async function uploadGalleryImageToSupabase(
  file: File,
  category: string
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
      };
    }

    // Validate file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      };
    }

    // Create a unique filename with category folder
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const sanitizedCategory = category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const fileName = `gallery/${sanitizedCategory}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from('Images') // Using the 'Images' bucket
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Gallery upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('Images')
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      return {
        success: false,
        error: 'Could not generate public URL for the uploaded image'
      };
    }

    return {
      success: true,
      url: publicUrlData.publicUrl
    };
  } catch (error: any) {
    console.error('Unexpected error during gallery image upload:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during upload'
    };
  }
}