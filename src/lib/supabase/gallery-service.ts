import { createClient } from '@supabase/supabase-js';

// Interface for a gallery item (file or folder)
interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  category: string;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
  type: 'file' | 'folder'; // Added type to differentiate files from folders
}

// Interface for gallery structure
interface GalleryStructure {
  folders: GalleryItem[];
  files: GalleryItem[];
}

// Interface for gallery album structure (as used in the gallery page)
interface GalleryAlbum {
  name: string;
  items: GalleryItem[];
}

/**
 * Fetch gallery entries from Supabase storage, treating entries without extensions as folders
 * @returns Object containing folders and files in the root gallery directory
 */
export async function getRootGalleryEntries(): Promise<GalleryStructure> {
  try {
    // Create Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return { folders: [], files: [] };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // List all files in the 'gallery' folder
    const { data: files, error } = await supabase.storage
      .from('Images') // Using the Images bucket
      .list('gallery/', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error('Error fetching gallery items from Supabase storage:', error);
      return { folders: [], files: [] };
    }

    if (!files || files.length === 0) {
      console.log('No gallery items found in Supabase storage');
      return { folders: [], files: [] };
    }

    console.log('Raw items from gallery/:', files); // Log the raw response to debug

    const folders: GalleryItem[] = [];
    const filesList: GalleryItem[] = [];
    const folderSet = new Set<string>(); // To track folders we've already added

    // Extract all unique folder names from file paths
    for (const file of files) {
      if (!file.name) continue; // Skip if file has no name

      const fileName = file.name;

      if (fileName.includes('/')) {
        // If the file is in a subfolder, extract the folder name
        const folderName = fileName.split('/')[0];

        // Add folder if not already added
        if (!folderSet.has(folderName)) {
          const folderEntry: GalleryItem = {
            id: Date.now() + Math.floor(Math.random() * 10000) + 500000 + Array.from(folderSet).length,
            src: '', // Folders don't have a direct src URL
            alt: folderName.charAt(0).toUpperCase() + folderName.slice(1), // Capitalize folder name
            category: 'folder',
            type: 'folder' // Marking as folder
          };
          folders.push(folderEntry);
          folderSet.add(folderName);
        }
      } else if (file.type === 'folder') { // If it's a folder type as returned by Supabase
        // Add folder if not already added
        if (!folderSet.has(fileName)) {
          const folderEntry: GalleryItem = {
            id: Date.now() + Math.floor(Math.random() * 10000) + 500000 + Array.from(folderSet).length,
            src: '', // Folders don't have a direct src URL
            alt: fileName.charAt(0).toUpperCase() + fileName.slice(1), // Capitalize folder name
            category: 'folder',
            type: 'folder' // Marking as folder
          };
          folders.push(folderEntry);
          folderSet.add(fileName);
        }
      }
    }

    // Process all files
    for (const file of files) {
      if (!file.name) continue; // Skip if file has no name

      const fileName = file.name;

      if (fileName.includes('/')) {
        // This is a file inside a subfolder
        const parts = fileName.split('/');
        const folderName = parts[0];
        const actualFileName = parts.slice(1).join('/');

        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('Images')
          .getPublicUrl(`gallery/${fileName}`);

        // Check if the file has an extension to determine if it's a file or a folder
        const hasExtension = actualFileName.includes('.');

        if (hasExtension) {
          // It's a file with an extension
          const fileEntry: GalleryItem = {
            id: Date.now() + Math.floor(Math.random() * 10000),
            src: publicUrl,
            alt: actualFileName.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
            category: folderName,
            type: 'file' // Marking as file
          };

          filesList.push(fileEntry);
        } else {
          // It's a file without an extension (treat as a folder)
          if (!folderSet.has(actualFileName)) {
            const folderEntry: GalleryItem = {
              id: Date.now() + Math.floor(Math.random() * 10000) + 250000,
              src: '', // Folders don't have a direct file URL
              alt: actualFileName.charAt(0).toUpperCase() + actualFileName.slice(1),
              category: folderName,
              type: 'folder' // Marking as folder
            };

            folders.push(folderEntry);
            folderSet.add(actualFileName);
          }
        }
      } else if (file.type !== 'folder') {
        // This is a file directly in the 'gallery' folder
        const { data: { publicUrl } } = supabase.storage
          .from('Images')
          .getPublicUrl(`gallery/${fileName}`);

        // Check if the file has an extension
        const hasExtension = fileName.includes('.');

        if (hasExtension) {
          // It's a file with an extension
          const fileEntry: GalleryItem = {
            id: Date.now() + Math.floor(Math.random() * 10000), // Temporary ID
            src: publicUrl,
            alt: fileName.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
            category: 'gallery',
            type: 'file' // Marking as file
          };

          filesList.push(fileEntry);
        } else {
          // It's a file without an extension (treat as a folder)
          if (!folderSet.has(fileName)) {
            const folderEntry: GalleryItem = {
              id: Date.now() + Math.floor(Math.random() * 10000) + 150000,
              src: '', // Folders don't have a direct file URL
              alt: fileName.charAt(0).toUpperCase() + fileName.slice(1),
              category: 'gallery',
              type: 'folder' // Marking as folder
            };

            folders.push(folderEntry);
            folderSet.add(fileName);
          }
        }
      }
    }

    console.log(`Found ${folders.length} gallery folders and ${filesList.length} gallery files in gallery/ directory`);
    return { folders, files: filesList };
  } catch (error) {
    console.error('Unexpected error fetching gallery items from storage:', error);
    return { folders: [], files: [] };
  }
}

/**
 * Fetch gallery images from a specific album folder in Supabase storage
 * @param folderName Name of the album folder to list contents for
 * @returns Array of gallery items in the specified folder
 */
export async function getGalleryAlbumContents(folderName: string): Promise<GalleryItem[]> {
  try {
    // Create Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // List files in the specific gallery album folder
    const { data: files, error } = await supabase.storage
      .from('Images') // Using the Images bucket
      .list(`gallery/${folderName}/`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error(`Error fetching contents from gallery album ${folderName}:`, error);
      return [];
    }

    if (!files || files.length === 0) {
      console.log(`No contents found in gallery album ${folderName}`);
      return [];
    }

    // Process all files in this specific gallery album
    const galleryItems: GalleryItem[] = [];

    for (const file of files) {
      if (!file.name) continue; // Skip if file has no name

      // Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('Images')
        .getPublicUrl(`gallery/${folderName}/${file.name}`);

      const fileEntry: GalleryItem = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        src: publicUrl,
        alt: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
        category: folderName,
        type: 'file' // Marking as file
      };

      galleryItems.push(fileEntry);
    }

    console.log(`Found ${galleryItems.length} images in gallery album ${folderName}`);
    return galleryItems;
  } catch (error) {
    console.error('Unexpected error fetching gallery album contents:', error);
    return [];
  }
}

/**
 * Main function to get gallery albums from Supabase storage
 * @returns Array of gallery albums with their items
 */
export async function getGalleryAlbumsFromStorage(): Promise<GalleryAlbum[]> {
  try {
    // Get the root gallery entries (folders are albums, files are direct gallery items)
    const rootStructure = await getRootGalleryEntries();

    // Process each folder as an album
    const albums: GalleryAlbum[] = [];

    // Add each folder as an album with its contents
    for (const folder of rootStructure.folders) {
      const folderName = folder.alt.toLowerCase(); // Use the alt text as folder name
      const folderContents = await getGalleryAlbumContents(folderName);

      if (folderContents.length > 0) {
        albums.push({
          name: folder.alt, // Use the folder name as album name
          items: folderContents
        });
      }
    }

    // If there are files directly in the gallery root, add them as a "General" album
    if (rootStructure.files.length > 0) {
      albums.push({
        name: "General",
        items: rootStructure.files
      });
    }

    console.log(`Successfully loaded ${albums.length} gallery albums from Supabase storage`);
    return albums;
  } catch (error) {
    console.error('Error in getGalleryAlbumsFromStorage:', error);
    return [];
  }
}