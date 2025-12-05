// src/app/documents/DocumentsContentClient.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { FiFile, FiFolder, FiDownload, FiExternalLink, FiArrowLeft, FiEye } from 'react-icons/fi';
import { getFolderContents } from '@/lib/supabase/documents-folder-service';
import { useSession } from 'next-auth/react';

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

interface DocumentAlbum {
  name: string;
  items: DocumentItem[];
}

interface DocumentsContentClientProps {
  documentAlbums: DocumentAlbum[];
}

export default function DocumentsContentClient({ documentAlbums }: DocumentsContentClientProps) {
  const { data: session, status } = useSession(); // Get session and status from NextAuth
  const [currentPath, setCurrentPath] = useState<string[]>([]); // Tracks the current navigation path
  const [currentItems, setCurrentItems] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize with root items
  useEffect(() => {
    const album = documentAlbums[0];
    if (album && album.items) {
      // Use all items as-is, since the artificial "Documents" folder is no longer created in the service
      const filteredItems = album.items;
      setCurrentItems(filteredItems);
    }
  }, [documentAlbums]);

  const handleFolderClick = async (folderName: string) => {
    // Check if the folder is private
    if (folderName.toLowerCase() === 'private') {
      // Check if user is authenticated using NextAuth session
      if (!session || status !== 'authenticated') {
        // Redirect to sign in page with callback URL to return to current location
        const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/auth/signin?callbackUrl=${currentUrl}`;
        return;
      }
    }

    setLoading(true);
    try {
      // Add the clicked folder to the navigation path
      const newPath = [...currentPath, folderName];
      setCurrentPath(newPath);

      // Fetch contents of the clicked folder
      const folderStructure = await getFolderContents(folderName);
      const allFolderItems = [...folderStructure.folders, ...folderStructure.files];

      // Set the new items to display
      setCurrentItems(allFolderItems);
    } catch (error) {
      console.error('Error loading folder contents:', error);
      // In case of error, go back to previous state
      if (currentPath.length > 0) {
        const prevPath = currentPath.slice(0, -1);
        setCurrentPath(prevPath);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = async () => {
    if (currentPath.length > 0) {
      setLoading(true);
      try {
        const newPath = currentPath.slice(0, -1);
        setCurrentPath(newPath);

        if (newPath.length === 0) {
          // Going back to root
          const album = documentAlbums[0];
          if (album && album.items) {
            // Use all items as-is, since the artificial "Documents" folder is no longer created in the service
            setCurrentItems(album.items);
          }
        } else {
          // Going back to a parent folder
          // We take the last folder in the path and fetch its contents
          const parentFolder = newPath[newPath.length - 1];

          // Check if navigating away from private folder
          if (currentPath[currentPath.length - 1].toLowerCase() === 'private') {
            // Optionally reset authentication when leaving private folder
            // This is optional depending on your security requirements
          }

          const folderStructure = await getFolderContents(parentFolder);
          const allFolderItems = [...folderStructure.folders, ...folderStructure.files];
          setCurrentItems(allFolderItems);
        }
      } catch (error) {
        console.error('Error going back:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Show breadcrumbs
  const showBreadcrumbs = currentPath.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="mb-6 flex items-center text-slate-400">
            <button
              onClick={handleGoBack}
              className="flex items-center text-accent-cyan hover:text-accent-cyan/80 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </button>
            <span className="mx-2">/</span>
            <span>{currentPath.join(' / ')}</span>
          </div>
        )}

        {/* Current folder title */}
        <h2 className="text-2xl font-bold mb-8 text-center">
          {currentPath.length > 0 ? `${currentPath[currentPath.length - 1]} Folder` : 'Root Documents'}
        </h2>

        {/* Display all items (folders and files) in a grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((item) => (
            item.type === 'folder' ? (
              // Render folder
              item.title.toLowerCase() === 'private' ? (
                // Render private folder with different UI based on authentication
                (session && status === 'authenticated') ? (
                  // Authenticated view - clickable like a regular folder
                  <motion.div
                    key={`folder-${item.id}`}
                    className="bg-slate-800/80 rounded-xl p-4 border border-emerald-500 hover:border-emerald-400 transition-colors cursor-pointer"
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleFolderClick(item.title)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="bg-slate-700 p-3 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{item.title}</h3>
                        <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                        <div className="mt-2 text-xs text-emerald-400">Private (Access Granted)</div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Non-authenticated view - locked and not clickable
                  <motion.div
                    key={`folder-${item.id}`}
                    className="bg-slate-800/60 rounded-xl p-4 border border-rose-700 opacity-70 cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => {
                      // When clicked, redirect to sign in with callback URL to return to current location
                      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
                      window.location.href = `/auth/signin?callbackUrl=${currentUrl}`;
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="bg-slate-700 p-3 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{item.title}</h3>
                        <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                        <div className="mt-2 text-xs text-rose-400">Private</div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <span className="text-xs text-rose-400 bg-rose-900/30 px-2 py-1 rounded cursor-pointer hover:underline">
                        Click to sign in
                      </span>
                    </div>
                  </motion.div>
                )
              ) : (
                // Render regular folder
                <motion.div
                  key={`folder-${item.id}`}
                  className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 hover:border-amber-500 transition-colors cursor-pointer"
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleFolderClick(item.title)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="bg-slate-700 p-3 rounded-lg">
                        <FiFolder className="text-amber-400 text-2xl" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{item.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                      <div className="mt-2 text-xs text-slate-500">Folder</div>
                    </div>
                  </div>
                </motion.div>
              )
            ) : (
              // Render file
              <motion.div
                key={`file-${item.id}`}
                className="bg-slate-900/80 rounded-xl p-4 border border-slate-700 hover:border-accent-cyan transition-colors"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <FiFile className="text-accent-cyan text-2xl" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{item.title}</h3>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{item.description}</p>

                    {/* File actions */}
                    <div className="flex space-x-2 mt-3">
                      <a
                        href={item.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiEye className="mr-1" />
                        <span>Preview</span>
                      </a>
                      <a
                        href={item.file}
                        download={item.title || 'document'}
                        className="flex items-center text-sm text-slate-300 hover:text-white transition-colors"
                      >
                        <FiDownload className="mr-1" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}