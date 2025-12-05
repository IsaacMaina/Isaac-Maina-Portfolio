// src/app/documents/[category]/DocumentCategoryClient.tsx
"use client";

import { motion } from "framer-motion";
import { FiFile, FiDownload, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

interface DocumentItem {
  id: number;
  title: string;
  file: string;
  description: string;
  category: string;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DocumentCategoryClientProps {
  categoryName: string;
  documents: DocumentItem[];
}

export default function DocumentCategoryClient({ categoryName, documents }: DocumentCategoryClientProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-4xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/documents" className="text-accent-cyan hover:text-cyan-400 inline-block">
            &larr; Back to All Documents
          </Link>
        </motion.div>

        <motion.h1
          className="text-4xl font-bold mb-4 text-center mt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <span className="text-accent-cyan">{categoryName}</span> Documents
        </motion.h1>

        <motion.p
          className="text-xl text-slate-400 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {documents.length} {documents.length === 1 ? 'document' : 'documents'} in the {categoryName} category.
        </motion.p>

        {documents.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-xl text-slate-400">No documents found in this category.</p>
            <Link href="/documents" className="text-accent-cyan hover:text-cyan-400 mt-4 inline-block">
              Browse all documents
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                className="card group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start">
                  <div className="mr-4 text-accent-cyan">
                    <FiFile size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{doc.title}</h3>
                    <p className="text-slate-400 mb-4">{doc.description}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    className="btn btn-primary flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();

                      // Create an async function to handle the download
                      const handleDownload = async () => {
                        try {
                          // Create a temporary link element to trigger download
                          const link = document.createElement('a');

                          // For Supabase files and external URLs, we need to fetch and download
                          if (doc.file.startsWith('http')) {
                            // If it's an external URL like Supabase storage, fetch it
                            const response = await fetch(doc.file);
                            const blob = await response.blob();

                            // Create a download URL for the blob
                            const downloadUrl = window.URL.createObjectURL(blob);
                            link.href = downloadUrl;
                            link.download = doc.title || `document-${doc.id}`;
                          } else {
                            // For local files, use the direct path
                            link.href = doc.file;
                            link.download = doc.title || `document-${doc.id}`;
                          }

                          // Trigger the download
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);

                          // Clean up the object URL if we created one
                          if (link.href.startsWith('blob:')) {
                            window.URL.revokeObjectURL(link.href);
                          }
                        } catch (error) {
                          console.error('Download error:', error);
                          // Fallback to opening in a new tab
                          window.open(doc.file, '_blank');
                        }
                      };

                      // Call the async function
                      handleDownload();
                    }}
                  >
                    <FiDownload className="mr-2" /> Download
                  </button>
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-cyan hover:text-cyan-400 flex items-center"
                    onClick={(e) => e.stopPropagation()} // Prevent folder click from firing
                  >
                    <FiExternalLink className="mr-1" /> Preview
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link href="/documents" className="btn btn-secondary inline-block">
            &larr; Back to All Document Categories
          </Link>
        </motion.div>
      </div>
    </div>
  );
}