import { createClient } from '@supabase/supabase-js';

// Interface for a gallery item
interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  category: string;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
  type: 'file' | 'folder';
}

// Interface for gallery structure
interface GalleryAlbum {
  name: string;
  items: GalleryItem[];
}

/**
 * Fetch gallery albums and their contents from Supabase storage
 * @returns Array of gallery albums with their items
 */
export async function getGalleryAlbumsFromStorage(): Promise<GalleryAlbum[]> {
  try {
    // Create Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const albums: GalleryAlbum[] = [];

    // First, list ALL items inside the 'gallery/' path (both files and folders)
    const { data: galleryItems, error: galleryError } = await supabase.storage
      .from('Images')
      .list('gallery/', {
        limit: 1000, // Increased limit to get all items
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (galleryError) {
      console.error('Error fetching gallery content from Supabase storage:', galleryError);
      return [];
    }

    if (!galleryItems || galleryItems.length === 0) {
      console.log('No gallery content found in Supabase storage');
      return [];
    }

    // Separate folders from direct files
    // In Supabase storage, when listing in a folder, the response contains both files and sub-folders
    // Sub-folders will have a path that ends with '/' or will have different properties than files
    // Usually, files have extensions and folders don't, but this could vary
    const folders = [];
    const directFiles = [];

    for (const item of galleryItems) {
      if (item.name.includes('.')) {
        // This is a file (has an extension)
        directFiles.push(item);
      } else {
        // This is likely a folder (no extension)
        folders.push(item);
      }
    }

    // Process each folder as an album
    for (const folder of folders) {
      // List all files in this specific album folder
      const { data: files, error: filesError } = await supabase.storage
        .from('Images')
        .list(`gallery/${folder.name}/`, {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (filesError) {
        console.error(`Error fetching files from gallery/${folder.name}/:`, filesError);
        continue;
      }

      if (files && files.length > 0) {
        // Process all files in this specific gallery album
        const galleryItems: GalleryItem[] = [];

        for (const file of files) {
          if (!file.name) continue; // Skip if file has no name

          // Generate a public URL for each image
          const { data: { publicUrl } } = supabase.storage
            .from('Images')
            .getPublicUrl(`gallery/${folder.name}/${file.name}`);

          const fileEntry: GalleryItem = {
            id: Date.now() + Math.floor(Math.random() * 10000) + galleryItems.length, // Generate temporary ID
            src: publicUrl,
            alt: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
            category: folder.name,
            type: 'file' // Marking as file
          };

          galleryItems.push(fileEntry);
        }

        // Add the album to the list
        albums.push({
          name: folder.name,
          items: galleryItems
        });
      }
    }

    // Process direct files in the root gallery folder as a separate album
    if (directFiles && directFiles.length > 0) {
      const directGalleryItems: GalleryItem[] = [];

      for (const file of directFiles) {
        if (!file.name) continue; // Skip if file has no name

        // Generate a public URL for each image
        const { data: { publicUrl } } = supabase.storage
          .from('Images')
          .getPublicUrl(`gallery/${file.name}`);

        const fileEntry: GalleryItem = {
          id: Date.now() + Math.floor(Math.random() * 10000) + directGalleryItems.length, // Generate temporary ID
          src: publicUrl,
          alt: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
          category: 'gallery', // Use 'gallery' as the default category for root files
          type: 'file' // Marking as file
        };

        directGalleryItems.push(fileEntry);
      }

      // Add root gallery files as a separate album if there are any
      if (directGalleryItems.length > 0) {
        albums.unshift({ // Add to the beginning of the array
          name: 'Gallery',
          items: directGalleryItems
        });
      }
    }

    console.log(`Successfully loaded ${albums.length} gallery albums from Supabase storage`);
    return albums;
  } catch (error) {
    console.error('Unexpected error fetching gallery albums from storage:', error);
    return [];
  }
}