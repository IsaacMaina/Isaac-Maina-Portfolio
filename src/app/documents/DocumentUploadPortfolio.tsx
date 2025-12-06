'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const DocumentUploadPortfolio = ({ currentPath, onUploadSuccess }: { currentPath: string; onUploadSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: string; message: string } | null>(null);
  const [targetFolder, setTargetFolder] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [existingFolders, setExistingFolders] = useState<string[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [useExistingFolder, setUseExistingFolder] = useState(false);

  // Fetch existing folders in the current path
  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoadingFolders(true);
      try {
        const { data, error } = await supabase
          .storage
          .from('Images')
          .list(currentPath, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
          });

        if (error) {
          console.error('Error fetching folders:', error);
        } else {
          // Filter out files and keep only folders (items with id === null)
          const folders = data?.filter(item => item.id === null && !item.name.startsWith('.folder-placeholder')).map(item => item.name) || [];
          setExistingFolders(folders);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoadingFolders(false);
      }
    };

    fetchFolders();
  }, [currentPath]);

  const createFolder = async (folderName: string) => {
    try {
      // Create a placeholder file to create the folder
      const placeholderFile = new File([""], ".folder-placeholder", { type: "text/plain" });
      const placeholderPath = `${currentPath}${folderName}/.folder-placeholder`;

      const { error } = await supabase
        .storage
        .from('Images')
        .upload(placeholderPath, placeholderFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // If folder already exists, the upload will fail, but that's ok
        if (!error.message.includes("The resource already exists")) {
          throw error;
        }
      }
      return true;
    } catch (error: any) {
      console.error('Error creating folder:', error);
      return false;
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${uuidv4()}.${fileExt}`;

    // Determine the upload path based on target folder
    let uploadPath = currentPath;
    if (targetFolder.trim() !== '') {
      uploadPath = `${currentPath}${targetFolder.trim()}/`;
      // Create the folder if it doesn't exist
      const folderCreated = await createFolder(targetFolder.trim());
      if (!folderCreated) {
        setUploadStatus({ type: 'error', message: 'Failed to create folder. Upload cancelled.' });
        return;
      }
    }

    const filePath = `${uploadPath}${fileName}`;

    setUploading(true);
    setUploadStatus(null);

    try {
      // Upload file to Supabase storage in the specified path
      const { error: uploadError } = await supabase
        .storage
        .from('Images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadStatus({ type: 'success', message: 'Document uploaded successfully!' });
      setTargetFolder(''); // Reset target folder after successful upload
      onUploadSuccess();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setUploadStatus({ type: 'error', message: `Upload failed: ${error.message || 'Unknown error'}` });
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <label className="block text-sm font-medium text-gray-700 mr-2">
            Upload to folder:
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={useExistingFolder}
              onChange={(e) => setUseExistingFolder(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-1 text-sm text-gray-600">Use existing folder</span>
          </label>
        </div>

        {useExistingFolder ? (
          // Dropdown for existing folders
          <div className="flex">
            <select
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">Select a folder</option>
              {isLoadingFolders ? (
                <option value="">Loading folders...</option>
              ) : existingFolders.length === 0 ? (
                <option value="">No folders available</option>
              ) : (
                existingFolders.map((folder, index) => (
                  <option key={index} value={folder}>{folder}</option>
                ))
              )}
            </select>
            <button
              type="button"
              onClick={() => setUseExistingFolder(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-r-md hover:bg-gray-600"
            >
              New
            </button>
          </div>
        ) : (
          // Input for new folder
          <div className="flex">
            <input
              type="text"
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              placeholder={`Enter folder name (current: ${currentPath})`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            <button
              type="button"
              onClick={async () => {
                if (targetFolder.trim() !== '') {
                  setCreatingFolder(true);
                  const folderCreated = await createFolder(targetFolder.trim());
                  if (folderCreated) {
                    setUploadStatus({ type: 'success', message: `Folder "${targetFolder.trim()}" created successfully!` });
                  } else {
                    setUploadStatus({ type: 'error', message: `Failed to create folder "${targetFolder.trim()}"` });
                  }
                  setCreatingFolder(false);
                }
              }}
              disabled={creatingFolder || targetFolder.trim() === ''}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creatingFolder ? 'Creating...' : 'Create'}
            </button>
          </div>
        )}

        <div className="flex items-center mt-2">
          <button
            type="button"
            onClick={() => setUseExistingFolder(!useExistingFolder)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {useExistingFolder ? 'Switch to create new folder' : 'Switch to existing folders'}
          </button>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop the file here ...</p>
        ) : (
          <p className="text-gray-600">
            Drag & drop a document here, or click to select a file
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Supports: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, JPG, PNG, GIF
        </p>
      </div>

      {uploading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Uploading...</span>
        </div>
      )}

      {uploadStatus && (
        <div className={`p-3 rounded ${uploadStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {uploadStatus.message}
        </div>
      )}
    </div>
  );
};

export default DocumentUploadPortfolio;