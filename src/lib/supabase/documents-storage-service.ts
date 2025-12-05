// src/lib/supabase/documents-storage-service.ts
import { createClient } from '@supabase/supabase-js';

// Interface for a document item (file)
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

// Interface for a document album (category)
interface DocumentAlbum {
  name: string;
  items: DocumentItem[];
}

/**
 * Fetch documents organized by folder from Supabase storage
 * @returns Array of document albums, each containing documents in that category/folder
 */
export async function getDocumentsByCategory(): Promise<DocumentAlbum[]> {
  try {
    // Create Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return [];
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // List all files in the 'documents' folder and its subfolders
    const { data: files, error } = await supabase.storage
      .from('Images') // Using the Images bucket
      .list('documents/', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error('Error fetching documents from Supabase storage:', error);
      return [];
    }

    if (!files || files.length === 0) {
      console.log('No documents found in Supabase storage');
      return [];
    }

    // Separate files in root folder and files in subfolders
    const rootFiles: DocumentItem[] = [];
    const subfolderFilesMap = new Map<string, DocumentItem[]>();

    for (const file of files) {
      if (!file.name) continue; // Skip if file has no name

      let fileName = file.name;

      // Check if this is a file in a subfolder (contains '/')
      if (fileName.includes('/')) {
        // This is a file in a subfolder
        const parts = fileName.split('/');
        const folderName = parts[0];
        const actualFileName = parts.slice(1).join('/');

        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('Images')
          .getPublicUrl(`documents/${fileName}`);

        const documentItem: DocumentItem = {
          id: Date.now() + Math.floor(Math.random() * 10000), // Temporary ID
          title: actualFileName.replace(/\.[^/.]+$/, ""), // Remove extension for title
          file: publicUrl,
          description: `Document in ${folderName} folder`,
          category: folderName,
          orderIndex: 0,
          type: 'file' // Marking as file
        };

        // Add to appropriate subfolder
        if (!subfolderFilesMap.has(folderName)) {
          subfolderFilesMap.set(folderName, []);
        }
        subfolderFilesMap.get(folderName)!.push(documentItem);
      } else {
        // This is a file directly in the 'documents' folder
        const { data: { publicUrl } } = supabase.storage
          .from('Images')
          .getPublicUrl(`documents/${fileName}`);

        const documentItem: DocumentItem = {
          id: Date.now() + Math.floor(Math.random() * 10000), // Temporary ID
          title: fileName.replace(/\.[^/.]+$/, ""), // Remove extension for title
          file: publicUrl,
          description: `Document in root folder`,
          category: 'documents', // Use 'documents' as category for root files
          orderIndex: 0,
          type: 'file' // Marking as file
        };

        rootFiles.push(documentItem);
      }
    }

    // Identify unique folder names in the system
    const uniqueFolderNames = Array.from(subfolderFilesMap.keys());

    // Create album structure showing both subfolders and root files as separate albums
    const documentAlbums: DocumentAlbum[] = [];

    // Add root files as a 'Documents' album (the main content of the root folder)
    if (rootFiles.length > 0) {
      documentAlbums.push({
        name: 'Documents',
        items: rootFiles
      });
    }

    // Add subfolder albums (these are the actual subfolders like 'documents' and 'private')
    for (const [folderName, items] of subfolderFilesMap) {
      documentAlbums.push({
        name: folderName.charAt(0).toUpperCase() + folderName.slice(1), // Capitalize folder name
        items: items
      });
    }

    return documentAlbums;
  } catch (error) {
    console.error('Unexpected error fetching documents from storage:', error);
    return [];
  }
}