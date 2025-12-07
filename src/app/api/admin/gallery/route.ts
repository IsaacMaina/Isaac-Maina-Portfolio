// src/app/api/admin/gallery/route.ts
// API route for admin gallery management (CRUD operations for gallery items in Supabase storage)
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authConfig';
import { createClient } from '@supabase/supabase-js';
import { revalidateTag } from 'next/cache';

// GET request to fetch all gallery items from Supabase storage only
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // List all items in the 'gallery' folder and subfolders from Supabase storage
    const { data: topLevelFiles, error: topLevelError } = await supabase.storage
      .from('Images') // Using the Images bucket
      .list('gallery/', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (topLevelError) {
      console.error('Error fetching top-level gallery items from Supabase storage:', topLevelError);
      return Response.json({ error: 'Failed to fetch gallery data from storage' }, { status: 500 });
    }

    // Array to store all gallery items
    const allGalleryItems = [];

    // Process top-level files (direct files in gallery folder)
    if (topLevelFiles) {
      for (const file of topLevelFiles) {
        if (file.type === 'folder') {
          // This is a folder - list its contents to get the actual gallery images
          const { data: folderContents, error: folderError } = await supabase.storage
            .from('Images')
            .list(`gallery/${file.name}/`, {
              limit: 1000,
              offset: 0,
              sortBy: { column: 'name', order: 'asc' },
            });

          if (folderError) {
            console.error(`Error fetching contents of folder ${file.name}:`, folderError);
            continue;
          }

          if (folderContents) {
            // Create gallery items for each file in the folder
            for (const folderFile of folderContents) {
              if (folderFile.type !== 'folder') { // Only include actual files, not subfolders
                const { data: { publicUrl } } = supabase.storage
                  .from('Images')
                  .getPublicUrl(`gallery/${file.name}/${folderFile.name}`);

                allGalleryItems.push({
                  id: Date.now() + Math.floor(Math.random() * 10000) + allGalleryItems.length, // Generate temporary ID
                  src: publicUrl,
                  alt: folderFile.name.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
                  category: file.name, // Use folder name as category
                  name: folderFile.name,
                  type: 'file'
                });
              }
            }
          }
        } else {
          // This is a file directly in the gallery folder
          const { data: { publicUrl } } = supabase.storage
            .from('Images')
            .getPublicUrl(`gallery/${file.name}`);

          allGalleryItems.push({
            id: Date.now() + Math.floor(Math.random() * 10000) + allGalleryItems.length, // Generate unique ID
            src: publicUrl,
            alt: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
            category: 'General', // For files directly in gallery folder
            name: file.name,
            type: 'file'
          });
        }
      }
    }

    // Return all gallery items found in storage
    return Response.json(allGalleryItems);
  } catch (error) {
    console.error('Error fetching gallery data from storage:', error);
    return Response.json({ error: 'Failed to fetch gallery data' }, { status: 500 });
  }
}

// PUT request for gallery management (currently just for cache invalidation)
export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In the storage-based approach, gallery items are managed directly in Supabase storage
    // The PUT method can be used for cache invalidation after operations
    const data = await request.json();

    // Cache invalidation after changes
    revalidateTag('gallery');
    return Response.json({ message: 'Gallery cache invalidated successfully' });
  } catch (error) {
    console.error('Error in gallery PUT operation:', error);
    return Response.json({ error: 'Failed to update gallery cache' }, { status: 500 });
  }
}

// DELETE request to remove a gallery item from Supabase storage
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, src } = await request.json();

    if (!src) {
      return Response.json({ error: 'Source path (src) is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Extract the file path from the full URL if needed
    let filePath = src;
    if (src.startsWith(process.env.NEXT_PUBLIC_SUPABASE_URL!)) {
      // Extract the path after the base URL
      const urlParts = src.split('/storage/v1/object/public/Images/');
      if (urlParts.length > 1) {
        filePath = urlParts[1];
      }
    } else if (!src.startsWith('gallery/')) {
      // If it doesn't start with gallery/, prepend it
      filePath = `gallery/${src}`;
    }

    // Delete the file from Supabase storage
    const { error } = await supabase.storage
      .from('Images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting gallery item from storage:', error);
      return Response.json({ error: `Failed to delete gallery item from storage: ${error.message}` }, { status: 500 });
    }

    // Cache invalidation after deletion
    revalidateTag('gallery');
    return Response.json({
      message: 'Gallery item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return Response.json({ error: 'Failed to delete gallery item' }, { status: 500 });
  }
}