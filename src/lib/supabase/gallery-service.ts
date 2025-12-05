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

    // First, list all folders inside the 'gallery/' path (these will be our albums)
    const { data: folders, error: foldersError } = await supabase.storage
      .from('Images')
      .list('gallery/', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (foldersError) {
      console.error('Error fetching gallery folders from Supabase storage:', foldersError);
      return [];
    }

    if (!folders || folders.length === 0) {
      console.log('No gallery folders found in Supabase storage');
      return [];
    }

    const albums: GalleryAlbum[] = [];

    // Process each folder as an album
    for (const folder of folders) {
      if (folder.type === 'folder') {
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
    }

    console.log(`Successfully loaded ${albums.length} gallery albums from Supabase storage`);
    return albums;
  } catch (error) {
    console.error('Unexpected error fetching gallery albums from storage:', error);
    return [];
  }
}