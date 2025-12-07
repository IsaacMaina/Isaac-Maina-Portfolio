// src/app/admin/GalleryManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { FiFolder, FiImage, FiChevronRight, FiChevronDown, FiChevronLeft, FiEdit2, FiTrash2, FiEye, FiSave, FiX } from 'react-icons/fi';

interface GalleryItem {
  id: string;
  name: string;
  path: string;
  category: string;
  publicUrl?: string;
  uploadedAt?: string;
  type: 'file' | 'folder';
  size?: number;
}

export default function GalleryManager() {
  const [currentPath, setCurrentPath] = useState<string>('gallery/');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '' });
  const [uploading, setUploading] = useState(false);
  const [targetFolder, setTargetFolder] = useState<string>('gallery/'); // For upload target
  const [existingFolders, setExistingFolders] = useState<string[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Fetch existing folders when current path changes
  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoadingFolders(true);
      try {
        // Create Supabase client for browser
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // List all items in gallery folder to extract folders
        const { data, error } = await supabase.storage
          .from('Images')
          .list('gallery/', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (error) {
          console.error('Error fetching folders:', error);
          setExistingFolders([]);
          return;
        }

        if (data) {
          // Filter out files and keep only folders (items without extensions)
          const folders = data
            .filter(item => !item.name.includes('.')) // Folders don't have extensions
            .map(item => item.name);
          setExistingFolders(folders);
        } else {
          setExistingFolders([]);
        }
      } catch (err) {
        console.error('Error in fetchFolders:', err);
        setExistingFolders([]);
      } finally {
        setIsLoadingFolders(false);
      }
    };

    fetchFolders();
    fetchGalleryItems(currentPath);
  }, [currentPath]);

  // Update targetFolder when currentPath changes
  useEffect(() => {
    setTargetFolder(currentPath);
  }, [currentPath]);

  const fetchGalleryItems = async (path: string) => {
    try {
      setLoading(true);
      setError(null);

      // Create Supabase client for browser
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // List items in the specified path
      const { data: items, error: listError } = await supabase.storage
        .from('Images') // Using the same bucket as images
        .list(path, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (listError) {
        console.error('Error fetching gallery items:', listError);
        setError('Failed to fetch gallery items from storage');
        return;
      }

      if (!items) {
        setGalleryItems([]);
        return;
      }

      // Process items to determine if they are files or folders
      const processedItems: GalleryItem[] = items
        .map(item => {
          // In Supabase storage, folders are identified differently
          // If the item.name contains "/" it's likely a subfolder content
          // For direct listing, if we're looking at the gallery/ folder,
          // subfolders appear as entries without extensions
          const isFile = item.name.includes('.'); // Simple heuristic: files have extensions

          if (isFile) {
            // This is a file
            const fullPath = `${path}${item.name}`;
            const { data: publicUrlData } = supabase.storage
              .from('Images')
              .getPublicUrl(fullPath);

            // Extract category from path (first directory level after 'gallery/')
            const pathParts = path.replace('gallery/', '').split('/').filter(p => p);
            const category = pathParts.length > 0 ? pathParts[0] : 'gallery';

            return {
              id: fullPath,
              name: item.name,
              path: fullPath,
              category: category,
              publicUrl: publicUrlData?.publicUrl,
              uploadedAt: item.created_at,
              type: 'file',
            };
          } else {
            // This is likely a folder
            return {
              id: `${path}${item.name}/`,
              name: item.name,
              path: `${path}${item.name}/`,
              category: 'folder',
              type: 'folder',
            };
          }
        })
        .sort((a, b) => {
          // Sort folders first, then files
          if (a.type === 'folder' && b.type === 'file') return -1;
          if (a.type === 'file' && b.type === 'folder') return 1;
          return a.name.localeCompare(b.name);
        });

      setGalleryItems(processedItems);
    } catch (err) {
      console.error('Error in fetchGalleryItems:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const enterFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
  };

  const goBack = () => {
    if (currentPath === 'gallery/') {
      // Already at root
      return;
    }

    // Go up one level
    const pathParts = currentPath.split('/').filter(p => p);
    if (pathParts.length > 1) {
      pathParts.pop(); // Remove current folder
      const newPath = pathParts.join('/') + '/';
      setCurrentPath(newPath);
    } else {
      setCurrentPath('gallery/');
    }
  };

  const deleteGalleryItem = async (itemPath: string, itemType: 'file' | 'folder') => {
    const itemName = itemPath.split('/').filter(p => p).pop() || itemPath;
    if (!confirm(`Are you sure you want to delete this ${itemType}: ${itemName}?`)) {
      return;
    }

    try {
      // Create Supabase client for browser
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      if (itemType === 'file') {
        // Delete a single file
        const { error } = await supabase.storage
          .from('Images')
          .remove([itemPath]); // Remove using the full path

        if (error) {
          console.error('Error deleting gallery item:', error);
          toast.error('Failed to delete gallery item');
          return;
        }
      } else {
        // For folder deletion, list all items in the folder and delete them recursively
        const { data: folderContents, error: listError } = await supabase.storage
          .from('Images')
          .list(itemPath, {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (listError) {
          console.error(`Error listing contents of folder ${itemPath}:`, listError);
          toast.error(`Failed to list contents of folder: ${listError.message}`);
          return;
        }

        if (folderContents && folderContents.length > 0) {
          // Collect all file paths to delete
          const filePaths: string[] = [];

          for (const item of folderContents) {
            if (item.type === 'folder') {
              // If there are subfolders, recursively list their contents as well
              const subfolderPath = `${itemPath}${item.name}/`;
              const { data: subfolderContents, error: subfolderError } = await supabase.storage
                .from('Images')
                .list(subfolderPath, {
                  limit: 1000,
                  offset: 0,
                  sortBy: { column: 'name', order: 'asc' },
                });

              if (!subfolderError && subfolderContents) {
                subfolderContents.forEach(subItem => {
                  if (subItem.type !== 'folder') {
                    filePaths.push(`${subfolderPath}${subItem.name}`);
                  }
                });
              }
            } else {
              // This is a file, add to deletion list
              filePaths.push(`${itemPath}${item.name}`);
            }
          }

          // Delete all files in the folder
          if (filePaths.length > 0) {
            const { error: deleteError } = await supabase.storage
              .from('Images')
              .remove(filePaths);

            if (deleteError) {
              console.error('Error deleting files in folder:', deleteError);
              toast.error('Failed to delete some files in the folder');
              return;
            }
          }
        }
      }

      // Refresh the current view
      fetchGalleryItems(currentPath);
      toast.success(`${itemType} deleted successfully`);
    } catch (err) {
      console.error(`Error deleting ${itemType}:`, err);
      toast.error(`An unexpected error occurred while deleting ${itemType}`);
    }
  };

  // Function to create a new folder
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const createNewFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Create a placeholder file to create the folder in Supabase storage
      // Supabase storage doesn't have true folders, but we can create a folder by uploading a file to a path
      const placeholderFile = new File([""], ".folder-placeholder", { type: "text/plain" });
      const folderPath = `${currentPath}${newFolderName}/.folder-placeholder`;

      const { error: uploadError } = await supabase.storage
        .from('Images')
        .upload(folderPath, placeholderFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error creating folder:', uploadError);
        toast.error('Failed to create folder');
        return;
      }

      // Clear the input and refresh the view
      setNewFolderName('');
      setIsCreatingFolder(false);
      fetchGalleryItems(currentPath);
      toast.success(`Folder "${newFolderName}" created successfully`);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('An unexpected error occurred while creating folder');
    }
  };

  // Function to handle file upload to selected folder
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      for (const file of files) {
        // Use targetFolder for upload location instead of currentPath
        const uploadPath = targetFolder.endsWith('/') ? targetFolder : `${targetFolder}/`;
        const { data, error } = await supabase.storage
          .from('Images')
          .upload(`${uploadPath}${file.name}`, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.error(`Upload error for ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}: ${error.message}`);
        } else {
          toast.success(`${file.name} uploaded successfully!`);
        }
      }

      // Refresh the list
      fetchGalleryItems(targetFolder); // Refresh with the target folder
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const startEditing = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditData({
      name: item.name,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const item = galleryItems.find(d => d.id === editingId);
    if (!item) return;

    // If name hasn't changed, just cancel editing
    if (editData.name === item.name) {
      setEditingId(null);
      return;
    }

    try {
      // Create Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // To rename, we need to copy to new location and remove the old one
      const pathParts = item.path.split('/');
      pathParts[pathParts.length - 1] = editData.name; // Replace the last part with new name
      const newPath = pathParts.join('/');

      // Copy the file to the new location
      const { error: copyError } = await supabase.storage
        .from('Images')
        .copy(item.path, newPath);

      if (copyError) {
        console.error('Error copying gallery item:', copyError);
        toast.error('Failed to rename gallery item');
        return;
      }

      // Delete the old file
      const { error: deleteError } = await supabase.storage
        .from('Images')
        .remove([item.path]);

      if (deleteError) {
        console.error('Error deleting old gallery item:', deleteError);
        toast.error('Old file not properly cleaned up');
      }

      // Refresh the current view
      setEditingId(null);
      fetchGalleryItems(currentPath);
      toast.success('Gallery item renamed successfully');
    } catch (err) {
      console.error('Error renaming gallery item:', err);
      toast.error('An unexpected error occurred');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Breadcrumbs and navigation */}
      <div className="flex items-center justify-between mb-4 p-2 bg-slate-800 rounded-lg">
        <div className="flex items-center">
          <button
            onClick={goBack}
            className={`mr-2 p-2 rounded ${currentPath === 'gallery/' ? 'text-slate-500 cursor-not-allowed' : 'text-accent-cyan hover:bg-slate-700'}`}
            disabled={currentPath === 'gallery/'}
            title="Go back to parent folder"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm text-slate-400">
            {currentPath === 'gallery/'
              ? 'Gallery Root'
              : `Gallery / ${currentPath.replace('gallery/', '').replace('/', ' / ')}`
            }
          </div>
        </div>
      </div>

      {/* Upload and folder creation section - works in any directory */}
      <div className="mb-6 p-4 bg-slate-800 rounded-lg">
        <div className="flex flex-col items-start gap-4">
          <h3 className="text-lg font-medium text-slate-300">
            Upload Images or Create Folders
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 w-full items-start">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Upload to folder:
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={targetFolder}
                  onChange={(e) => setTargetFolder(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan text-slate-200 mb-2 sm:mb-0 sm:mr-2 sm:rounded-r-none sm:mb-0"
                >
                  <option value="gallery/">Root Directory</option>
                  {existingFolders.map((folder) => (
                    <option key={folder} value={`gallery/${folder}/`}>
                      {folder}
                    </option>
                  ))}
                </select>

                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  accept="image/*"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
              {isCreatingFolder ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') createNewFolder();
                      if (e.key === 'Escape') setIsCreatingFolder(false);
                    }}
                    autoFocus
                  />
                  <button
                    onClick={createNewFolder}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setIsCreatingFolder(false)}
                    className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Create Folder
                </button>
              )}
            </div>
          </div>

          {uploading && (
            <div className="flex items-center text-slate-400">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-accent-cyan mr-2"></div>
              Uploading...
            </div>
          )}
        </div>
      </div>

      {/* Gallery items table */}
      <table className="min-w-full divide-y divide-slate-700">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Uploaded</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {galleryItems.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                This folder is empty
              </td>
            </tr>
          ) : (
            galleryItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-700/50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div
                    className={`flex items-center ${item.type === 'folder' ? 'cursor-pointer hover:text-accent-cyan' : ''}`}
                    onClick={() => item.type === 'folder' && enterFolder(item.path)}
                    title={item.type === 'folder' ? "Click to open folder" : undefined}
                  >
                    {item.type === 'folder' ? (
                      <FiFolder className="text-amber-400 mr-2" />
                    ) : (
                      <FiImage className="text-blue-400 mr-2" />
                    )}
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                        className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded focus:outline-none focus:ring-1 focus:ring-accent-cyan text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                    ) : (
                      <span className="text-sm font-medium" title={item.name}>
                        {item.name.length > 50 ? `${item.name.substring(0, 50)}...` : item.name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
                    {item.type === 'folder' ? 'Folder' : 'Image'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">
                  {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                  {item.type === 'folder' ? (
                    // Folder actions
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event bubbling to row
                          enterFolder(item.path);
                        }}
                        className="text-accent-cyan hover:text-cyan-400"
                        title="Enter folder"
                      >
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event bubbling to row
                          deleteGalleryItem(item.path, item.type);
                        }}
                        className="text-red-500 hover:text-red-400"
                        title="Delete folder"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    // File actions
                    <>
                      <a
                        href={item.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-cyan hover:text-cyan-400"
                        title="View image"
                        onClick={(e) => e.stopPropagation()} // Prevent event bubbling to row
                      >
                        <FiEye className="w-4 h-4" />
                      </a>

                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling to row
                              saveEdit();
                            }}
                            className="text-green-500 hover:text-green-400 ml-2"
                            title="Save changes"
                          >
                            <FiSave className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent event bubbling to row
                              cancelEdit();
                            }}
                            className="text-slate-500 hover:text-slate-400 ml-2"
                            title="Cancel"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling to row
                            startEditing(item);
                          }}
                          className="text-yellow-500 hover:text-yellow-400 ml-2"
                          title="Rename image"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event bubbling to row
                          deleteGalleryItem(item.path, item.type);
                        }}
                        className="text-red-500 hover:text-red-400 ml-2"
                        title="Delete image"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}