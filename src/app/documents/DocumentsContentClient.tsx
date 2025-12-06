// src/app/documents/DocumentsContentClient.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { FiFile, FiFolder, FiDownload, FiExternalLink, FiArrowLeft, FiEye, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

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

  // Function to get all files in the current view to enable navigation in the preview modal
  const getAllFiles = () => {
    return currentItems.filter(item => item.type === 'file');
  };

  const openPreviewModal = (index: number) => {
    const file = getAllFiles()[index];
    if (!file) return;

    // Just use the file.file URL already provided from the service
    const fileExtension = file.file.split(".").pop()?.toLowerCase();

    const canPreview = ["jpg","jpeg","png","gif","bmp","webp","pdf"]
      .includes(fileExtension || "");

    setCurrentPreviewIndex(index);
    setPreviewModalOpen(true);
    setPreviewError(false);
  };

  const closePreviewModal = () => {
    setPreviewModalOpen(false);
    setCurrentPreviewIndex(null);
    setPreviewError(false); // Reset error state when closing
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    if (currentPreviewIndex === null) return;

    const allFiles = getAllFiles();
    if (allFiles.length === 0) return;

    let newIndex = currentPreviewIndex;
    if (direction === 'next') {
      newIndex = (currentPreviewIndex + 1) % allFiles.length;
    } else {
      newIndex = (currentPreviewIndex - 1 + allFiles.length) % allFiles.length;
    }

    setCurrentPreviewIndex(newIndex);
    setPreviewError(false); // Reset error when navigating
    setPreviewLoading(true);
    // Reset loading state after a brief moment to allow re-rendering
    setTimeout(() => setPreviewLoading(false), 100);
  };

  // Function to export document as PDF
  const exportAsPdf = async () => {
    if (currentPreviewIndex === null || !currentFile) return;

    setExporting(true);
    try {
      const fileExtension = currentFile.file.split('.').pop()?.toLowerCase();

      // For PDF files, just download directly
      if (fileExtension === 'pdf') {
        const link = document.createElement('a');
        link.href = currentFile.file;
        link.download = `${currentFile.title}.pdf`;
        link.click();
        return;
      }

      // For images, we can create a simple PDF with the image
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '')) {
        // Dynamically import jsPDF for PDF creation
        const { jsPDF } = await import('jspdf');

        // Create a temporary image element
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = currentFile.file;

        img.onload = () => {
          // Create PDF with proper dimensions
          const pdf = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [img.width, img.height]
          });

          pdf.addImage(img, 'JPEG', 0, 0, img.width, img.height);
          pdf.save(`${currentFile.title}.pdf`);
        };

        return;
      }

      // For text files, create a PDF with the text content
      if (['txt', 'csv', 'json', 'xml', 'md'].includes(fileExtension || '')) {
        const response = await fetch(currentFile.file);
        const content = await response.text();

        const { jsPDF } = await import('jspdf');

        const pdf = new jsPDF();
        pdf.setFontSize(12);

        // Add content to PDF with automatic page breaks
        const pageHeight = pdf.internal.pageSize.height - 20;
        // @ts-ignore: splitTextToSize may not be typed correctly
        const lines = pdf.splitTextToSize(content, 180);

        let y = 10;
        lines.forEach((line: string) => {
          if (y > pageHeight) {
            pdf.addPage();
            y = 10;
          }
          // @ts-ignore: text method may not be typed correctly
          pdf.text(line, 10, y);
          y += 7;
        });

        pdf.save(`${currentFile.title}.pdf`);
        return;
      }

      // For other file types, just download the original file
      const link = document.createElement('a');
      link.href = currentFile.file;
      link.download = `${currentFile.title}.${fileExtension}`;
      link.click();
    } catch (error) {
      console.error('Error exporting file as PDF:', error);
      // If export fails, just download the original file
      if (currentFile) {
        const link = document.createElement('a');
        link.href = currentFile.file;
        link.download = currentFile.title;
        link.click();
      }
    } finally {
      setExporting(false);
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

  // Get the current file to preview
  const allFiles = getAllFiles();
  const currentFile = currentPreviewIndex !== null ? allFiles[currentPreviewIndex] : null;

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
                      <button
                        onClick={() => {
                          const fileIndex = getAllFiles().findIndex(f => f.id === item.id);
                          if (fileIndex !== -1) {
                            openPreviewModal(fileIndex);
                          }
                        }}
                        className="flex items-center text-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                      >
                        <FiEye className="mr-1" />
                        <span>Preview</span>
                      </button>
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

      {/* Preview Modal */}
      {previewModalOpen && currentFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-800 rounded-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold truncate max-w-xs md:max-w-md lg:max-w-lg">
                {currentFile.title}
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={exportAsPdf}
                  disabled={exporting}
                  className={`p-2 rounded-full transition-colors ${
                    exporting
                      ? 'text-slate-500 cursor-not-allowed'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title={exporting ? "Exporting..." : "Export as PDF"}
                >
                  {exporting ? (
                    <div className="w-5 h-5 border-t-2 border-slate-500 border-solid rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                </button>
                <a
                  href={currentFile.file}
                  download={currentFile.title}
                  className="text-slate-300 hover:text-white hover:bg-slate-700 p-2 rounded-full transition-colors"
                  title="Download Original"
                >
                  <FiDownload className="w-5 h-5" />
                </a>
                <button
                  onClick={closePreviewModal}
                  className="text-slate-300 hover:text-white hover:bg-slate-700 p-2 rounded-full transition-colors"
                  title="Close"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content - Document Preview */}
            <div className="flex-1 overflow-auto max-h-[70vh]">
              {previewLoading ? (
                <div className="flex items-center justify-center h-[70vh] w-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4">
                  <FiFile className="w-16 h-16 text-slate-500 mb-4" />
                  <h4 className="text-xl font-semibold mb-2">File Not Found</h4>
                  <p className="text-slate-400 mb-4">
                    The requested file could not be found in storage.
                  </p>
                  <a
                    href={currentFile?.file || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-accent-cyan text-slate-900 rounded-lg font-medium hover:bg-cyan-400 transition-colors"
                  >
                    Try Opening in New Tab
                  </a>
                </div>
              ) : (
                <div className="p-4">
                  {/* Determine how to display the document based on file type */}
                  {currentFile?.file && (
                    (() => {
                      const fileExtension = currentFile.file.split('.').pop()?.toLowerCase();

                      // Check if it's an image file
                      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '')) {
                        console.log('Previewing image:', currentFile.file); // Debug log
                        return (
                          <div className="flex justify-center">
                            <img
                              src={currentFile.file}
                              alt={currentFile.title}
                              className="max-h-[70vh] object-contain rounded-lg"
                              onError={() => {
                                console.error('Image failed to load:', currentFile.file); // Debug log
                                setPreviewError(true)
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', currentFile.file); // Debug log
                                setPreviewError(false)
                              }}
                            />
                          </div>
                        );
                      }

                      // Check if it's a PDF
                      else if (fileExtension === 'pdf') {
                        console.log('Previewing PDF:', currentFile.file); // Debug log
                        return (
                          <div className="flex justify-center w-full">
                            {/* Direct iframe approach for PDFs to ensure direct access from Supabase */}
                            <iframe
                              src={currentFile.file}
                              className="w-full h-[70vh] border-0 rounded-lg"
                              title={currentFile.title}
                              onError={() => {
                                console.error('PDF failed to load:', currentFile.file); // Debug log
                                setPreviewError(true)
                              }}
                            />
                          </div>
                        );
                      }

                      // Check if it's a text-based document (txt, csv, etc.)
                      else if (['txt', 'csv', 'json', 'xml', 'md'].includes(fileExtension || '')) {
                        console.log('Previewing text file:', currentFile.file); // Debug log
                        return (
                          <div className="max-h-[70vh] overflow-auto bg-slate-900 p-4">
                            {/* Direct fetch and display for text files to access directly from Supabase */}
                            <iframe
                              src={currentFile.file}
                              className="w-full h-[70vh] border-0 rounded-lg bg-white text-black"
                              title={currentFile.title}
                              onError={() => {
                                console.error('Text file failed to load:', currentFile.file); // Debug log
                                setPreviewError(true)
                              }}
                            />
                          </div>
                        );
                      }

                      // Check if it's a Microsoft Office document (attempt to render using Office Online)
                      else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension || '')) {
                        console.log('Previewing Office document:', currentFile.file); // Debug log
                        // Use Microsoft Office Online viewer for Office documents - direct access
                        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentFile.file)}`;

                        return (
                          <div className="flex justify-center w-full">
                            <iframe
                              src={officeViewerUrl}
                              className="w-full h-[70vh] border-0 rounded-lg"
                              title={currentFile.title}
                              onError={() => {
                                console.error('Office document failed to load:', currentFile.file); // Debug log
                                setPreviewError(true)
                              }}
                            />
                          </div>
                        );
                      }

                      // For other document types, show a link to open in new tab
                      else {
                        return (
                          <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4">
                            <FiFile className="w-16 h-16 text-slate-500 mb-4" />
                            <h4 className="text-xl font-semibold mb-2">{currentFile.title}</h4>
                            <p className="text-slate-400 mb-4">
                              This document type ({fileExtension}) cannot be previewed in the browser.
                            </p>
                            <div className="flex gap-3">
                              <a
                                href={currentFile.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-accent-cyan text-slate-900 rounded-lg font-medium hover:bg-cyan-400 transition-colors"
                              >
                                View in Browser
                              </a>
                              <a
                                href={currentFile.file}
                                download={currentFile.title}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        );
                      }
                    })()
                  )}
                </div>
              )}
            </div>

            {/* Navigation controls */}
            {allFiles.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="flex items-center space-x-4 bg-slate-900/80 px-4 py-2 rounded-full">
                  <button
                    onClick={() => navigatePreview('prev')}
                    className="p-2 rounded-full hover:bg-slate-700 transition-colors"
                    title="Previous document"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm">
                    {currentPreviewIndex !== null ? currentPreviewIndex + 1 : 0} of {allFiles.length}
                  </span>
                  <button
                    onClick={() => navigatePreview('next')}
                    className="p-2 rounded-full hover:bg-slate-700 transition-colors"
                    title="Next document"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}