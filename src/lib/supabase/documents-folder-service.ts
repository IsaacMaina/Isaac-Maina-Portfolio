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
      // If we get an error trying to list the documents/ folder, let's try to list the root
      console.log('Attempting to list root level due to error...');
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('Images')
        .list('', {  // List from root
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (rootError) {
        console.error('Error listing root files:', rootError);
        return { folders: [], files: [] };
      } else {
        console.log('Root level files:', rootFiles);
        // Filter for files that might be document-related
        const possibleDocumentFiles = rootFiles.filter(item =>
          item.name.startsWith('documents/') ||
          item.name.endsWith('.pdf') ||
          item.name.endsWith('.doc') ||
          item.name.endsWith('.docx') ||
          item.name.includes('document')
        );
        console.log('Possible document files:', possibleDocumentFiles);
        if (possibleDocumentFiles.length > 0) {
          return { folders: [], files: possibleDocumentFiles };
        }
        // If no document-like files found, return empty
        return { folders: [], files: [] };
      }
    }

    console.log('Raw files from Supabase storage:', files); // Debug log

    if (!files || files.length === 0) {
      console.log('No files found in documents/ folder, checking root level...');
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('Images')
        .list('', {  // List from root
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (rootError) {
        console.error('Error listing root files:', rootError);
      } else {
        console.log('Root level files:', rootFiles);
        // Filter for files that start with 'documents/'
        const documentFiles = rootFiles.filter(item => item.name.startsWith('documents/'));
        console.log('Files starting with "documents/":', documentFiles);
        if (documentFiles.length > 0) {
          // This means files exist at a different level than expected
          return { folders: [], files: documentFiles };
        }
      }

      console.log('No documents found in Supabase storage');
      return { folders: [], files: [] };
    }

    const folders: DocumentItem[] = [];
    const filesList: DocumentItem[] = [];
    const folderSet = new Set<string>(); // To track folders we've already added

    // Process all files first to identify all unique folders
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

      // The file.name returned by .list('documents/', ...) includes subdirectories
      // If a file is at documents/documents/filename.pdf, the file.name will be "documents/filename.pdf"
      const fileName = file.name;

      // Simply prepend the root folder to get the full path
      // Supabase .list("documents/") returns names like "documents/filename.pdf"
      // So fullPath is "documents/" + "documents/filename.pdf" = "documents/documents/filename.pdf"
      const fullPath = `documents/${fileName}`;

      const { data: { publicUrl } } = supabase.storage
        .from("Images")
        .getPublicUrl(fullPath);

      console.log("LISTED:", fileName, " -> FULL:", fullPath); // Debug log

      if (fileName.includes('/')) {
        // This is a file inside a subfolder (e.g., documents/subfolder/filename.pdf)
        const parts = fileName.split('/');
        const folderName = parts[0]; // This could be 'documents' if path is documents/documents/file.pdf
        const actualFileName = parts.slice(1).join('/'); // Rest of the path

        // Check if the file has an extension to determine if it's a file or a folder
        const hasExtension = actualFileName.includes('.') || parts[parts.length - 1].includes('.');

        if (hasExtension) {
          // It's a file with an extension
          const fileEntry: DocumentItem = {
            id: Date.now() + Math.floor(Math.random() * 10000),
            title: actualFileName.replace(/\.[^/.]+$/, ""), // Remove extension for title
            file: publicUrl, // Use the properly constructed public URL
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
        // Check if the file has an extension
        const hasExtension = fileName.includes('.');

        if (hasExtension) {
          // It's a file with an extension
          const fileEntry: DocumentItem = {
            id: Date.now() + Math.floor(Math.random() * 10000), // Temporary ID
            title: fileName.replace(/\.[^/.]+$/, ""), // Remove extension for title
            file: publicUrl, // Use the properly constructed public URL
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

    console.log(`Raw files from folder ${folderName}:`, files); // Debug log

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

      // Rebuild the storage path: documents/folderName/fileName
      // When we call .list('documents/certificates/'), Supabase returns 'filename.pdf' as the name
      // So the full path to access is 'documents/certificates/filename.pdf'
      const correctStoragePath = `documents/${folderName}/${fileName}`;

      // For items in a specific folder, determine if it's a file or potential folder
      // based on whether it has a file extension
      const hasExtension = fileName.includes('.');

      if (hasExtension) {
        // It's a file with an extension
        const { data: { publicUrl } } = supabase.storage
          .from('Images')
          .getPublicUrl(correctStoragePath); // Use the corrected path format

        console.log(`Folder ${folderName} - File name from Supabase: ${fileName}, Full path: ${correctStoragePath}`); // Debug log

        const fileEntry: DocumentItem = {
          id: Date.now() + Math.floor(Math.random() * 10000),
          title: fileName.replace(/\.[^/.]+$/, ""), // Remove extension for title
          file: publicUrl, // Use properly constructed URL
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