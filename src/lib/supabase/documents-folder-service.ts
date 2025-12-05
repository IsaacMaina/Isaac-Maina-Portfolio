// src/lib/supabase/documents-folder-service.ts
import { createClient } from '@supabase/supabase-js';

// Interface for a document item (file or folder)
interface DocumentItem {
  id: number;
  title: string;
  file: string;
  description: string;
  category: string;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
  type: 'file' | 'folder'; // Added type to differentiate files from folders
}

// Interface for folder structure
interface FolderStructure {
  folders: DocumentItem[];
  files: DocumentItem[];
}

/**
 * Fetch document entries from Supabase storage, treating entries without extensions as folders
 * @returns Object containing folders and files in the root directory
 */
export async function getRootDocumentEntries(): Promise<FolderStructure> {
  try {
    // Create Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return { folders: [], files: [] };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // List all files in the 'documents' folder
    const { data: files, error } = await supabase.storage
      .from('Images') // Using the Images bucket
      .list('documents/', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error('Error fetching documents from Supabase storage:', error);
      return { folders: [], files: [] };
    }

    if (!files || files.length === 0) {
      console.log('No documents found in Supabase storage');
      return { folders: [], files: [] };
    }

    const folders: DocumentItem[] = [];
    const filesList: DocumentItem[] = [];
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
          const folderEntry: DocumentItem = {
            id: Date.now() + Math.floor(Math.random() * 10000) + 500000 + Array.from(folderSet).length,
            title: folderName.charAt(0).toUpperCase() + folderName.slice(1), // Capitalize folder name
            file: '', // Folders don't have a direct file URL
            description: `Folder containing documents`,
            category: 'folder',
            orderIndex: 0,
            type: 'folder' // Marking as folder
          };
          folders.push(folderEntry);
          folderSet.add(folderName);
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
          .getPublicUrl(`documents/${fileName}`);

        // Check if the file has an extension to determine if it's a file or a folder
        const hasExtension = actualFileName.includes('.');

        if (hasExtension) {
          // It's a file with an extension
          const fileEntry: DocumentItem = {
            id: Date.now() + Math.floor(Math.random() * 10000),
            title: actualFileName.replace(/\.[^/.]+$/, ""), // Remove extension for title
            file: publicUrl,
            description: `Document in ${folderName} folder`,
            category: folderName,
            orderIndex: 0,
            type: 'file' // Marking as file
          };

          filesList.push(fileEntry);
        } else {
          // It's a file without an extension (treat as a folder)
          if (!folderSet.has(actualFileName)) {
            const folderEntry: DocumentItem = {
              id: Date.now() + Math.floor(Math.random() * 10000) + 250000,
              title: actualFileName.charAt(0).toUpperCase() + actualFileName.slice(1),
              file: '', // Folders don't have a direct file URL
              description: `Folder in ${folderName}`,
              category: folderName,
              orderIndex: 0,
              type: 'folder' // Marking as folder
            };

            folders.push(folderEntry);
            folderSet.add(actualFileName);
          }
        }
      } else {
        // This is a file directly in the 'documents' folder
        const { data: { publicUrl } } = supabase.storage
          .from('Images')
          .getPublicUrl(`documents/${fileName}`);

        // Check if the file has an extension
        const hasExtension = fileName.includes('.');

        if (hasExtension) {
          // It's a file with an extension
          const fileEntry: DocumentItem = {
            id: Date.now() + Math.floor(Math.random() * 10000), // Temporary ID
            title: fileName.replace(/\.[^/.]+$/, ""), // Remove extension for title
            file: publicUrl,
            description: `Document in root folder`,
            category: 'documents',
            orderIndex: 0,
            type: 'file' // Marking as file
          };

          filesList.push(fileEntry);
        } else {
          // It's a file without an extension (treat as a folder)
          if (!folderSet.has(fileName)) {
            const folderEntry: DocumentItem = {
              id: Date.now() + Math.floor(Math.random() * 10000) + 150000,
              title: fileName.charAt(0).toUpperCase() + fileName.slice(1),
              file: '', // Folders don't have a direct file URL
              description: `Folder in root`,
              category: 'documents',
              orderIndex: 0,
              type: 'folder' // Marking as folder
            };

            folders.push(folderEntry);
            folderSet.add(fileName);
          }
        }
      }
    }

    return { folders, files: filesList };
  } catch (error) {
    console.error('Unexpected error fetching documents from storage:', error);
    return { folders: [], files: [] };
  }
}

/**
 * Fetch documents from a specific folder in Supabase storage
 * @param folderName Name of the folder to list contents for
 * @returns Object containing subfolders and files in the specified folder
 */
export async function getFolderContents(folderName: string): Promise<FolderStructure> {
  try {
    // Create Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return { folders: [], files: [] };
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // List files in the specific folder
    const { data: files, error } = await supabase.storage
      .from('Images') // Using the Images bucket
      .list(`documents/${folderName}/`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error(`Error fetching contents from folder ${folderName}:`, error);
      return { folders: [], files: [] };
    }

    if (!files || files.length === 0) {
      console.log(`No contents found in folder ${folderName}`);
      return { folders: [], files: [] };
    }

    const folders: DocumentItem[] = [];
    const filesList: DocumentItem[] = [];
    const folderSet = new Set<string>(); // To track folders we've already added

    // Process all files in this specific folder
    for (const file of files) {
      if (!file.name) continue; // Skip if file has no name

      const fileName = file.name;

      // For items in a specific folder, determine if it's a file or potential folder
      // based on whether it has a file extension
      const hasExtension = fileName.includes('.');

      if (hasExtension) {
        // It's a file with an extension
        const { data: { publicUrl } } = supabase.storage
          .from('Images')
          .getPublicUrl(`documents/${folderName}/${fileName}`);

        const fileEntry: DocumentItem = {
          id: Date.now() + Math.floor(Math.random() * 10000),
          title: fileName.replace(/\.[^/.]+$/, ""), // Remove extension for title
          file: publicUrl,
          description: `Document in ${folderName} folder`,
          category: folderName,
          orderIndex: 0,
          type: 'file' // Marking as file
        };

        filesList.push(fileEntry);
      } else {
        // It's a file without an extension (treat as a potential subfolder)
        // First, let's try to see if this "file" is actually a subfolder by attempting to list its contents
        // For now, we'll treat all extensionless items as folders in this context
        if (!folderSet.has(fileName)) {
          const folderEntry: DocumentItem = {
            id: Date.now() + Math.floor(Math.random() * 10000) + 250000,
            title: fileName.charAt(0).toUpperCase() + fileName.slice(1),
            file: '', // Folders don't have a direct file URL
            description: `Subfolder in ${folderName}`,
            category: folderName,
            orderIndex: 0,
            type: 'folder' // Marking as folder
          };

          folders.push(folderEntry);
          folderSet.add(fileName);
        }
      }
    }

    return { folders, files: filesList };
  } catch (error) {
    console.error('Unexpected error fetching folder contents:', error);
    return { folders: [], files: [] };
  }
}