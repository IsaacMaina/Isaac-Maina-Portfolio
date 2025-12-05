import { getDocuments } from "@/lib/db-service";
import { getRootDocumentEntries } from "@/lib/supabase/documents-folder-service";
import DocumentsContentClient from "./DocumentsContentClient";

// Define the document item structure based on the database schema
interface DocumentItem {
  id: number;
  title: string;
  file: string;
  description: string;
  category: string;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
  type: 'file' | 'folder';
}

// Define the document album structure
interface DocumentAlbum {
  name: string;
  items: DocumentItem[];
}

export default async function DocumentsPage() {
  // Fetch both document entries from Supabase storage and database records
  const rootStructure = await getRootDocumentEntries();
  const dbDocuments = await getDocuments();

  // Create a mapping from file paths to document titles from the database
  const dbTitleMap = new Map<string, { title: string; description?: string; id: number }>();
  if (dbDocuments && Array.isArray(dbDocuments)) {
    for (const doc of dbDocuments) {
      if (doc.file) {
        // Extract just the file name from the path (last segment)
        // The file path might be in format: /documents/certificates/filename.pdf or similar paths
        const fileName = doc.file.split('/').pop() || doc.file;
        dbTitleMap.set(fileName, {
          title: doc.title,
          description: doc.description || `Document in root folder`,
          id: doc.id
        });

        // Also add the full path as an alternative match in case Supabase returns full paths
        dbTitleMap.set(doc.file, {
          title: doc.title,
          description: doc.description || `Document in root folder`,
          id: doc.id
        });
      }
    }
  }

  // Merge storage files with database titles
  const folders = rootStructure.folders;
  const filesWithTitles = rootStructure.files.map(file => {
    // Try to get the title from database first, fallback to the file name
    // First check with the full file URL path
    let dbDoc = dbTitleMap.get(file.file);

    // Then try extracting just the filename from the URL
    if (!dbDoc) {
      // Extract the filename from the public URL by taking the last part after the last slash
      const urlParts = file.file.split('/');
      let fileName = urlParts[urlParts.length - 1];

      // If the URL has query parameters, remove them
      if (fileName.includes('?')) {
        fileName = fileName.split('?')[0];
      }

      dbDoc = dbTitleMap.get(fileName);
    }

    if (dbDoc) {
      return {
        ...file,
        title: dbDoc.title,
        description: dbDoc.description || file.description,
        id: dbDoc.id // Use the database ID if available
      };
    }
    return file; // Use original file if no database record found
  });

  const allRootItems = [...folders, ...filesWithTitles];

  // If no entries from storage, fetch from DB
  if (allRootItems.length === 0) {
    if (dbDocuments && dbDocuments.length > 0) {
      const dbDocumentsWithTypes: DocumentItem[] = dbDocuments.map(item => ({
        ...item,
        type: 'file', // All database documents are files, not folders
        file: item.file || '' // Ensure file property exists
      }));

      return (
        <div className="min-h-screen bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4 text-center">
              <span className="text-accent-cyan">Documents</span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 text-center max-w-3xl mx-auto">
              Explore my professional documents.
            </p>
            <DocumentsContentClient documentAlbums={[{
              name: "Documents",
              items: dbDocumentsWithTypes
            }]} />
          </div>
        </div>
      );
    } else {
      // If neither storage files nor database records exist, show empty state
      return (
        <div className="min-h-screen bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4 text-center">
              <span className="text-accent-cyan">Document Explorer</span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 text-center max-w-3xl mx-auto">
              No documents available at the moment.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-4 text-center">
          <span className="text-accent-cyan">Document Explorer</span>
        </h1>
        <p className="text-xl text-slate-400 mb-12 text-center max-w-3xl mx-auto">
          Explore my professional documents organized by folder and file structure.
        </p>
        <DocumentsContentClient documentAlbums={[{
          name: "Root",
          items: allRootItems
        }]} />
      </div>
    </div>
  );
}