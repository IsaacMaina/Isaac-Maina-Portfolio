'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Document {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  size: number;
}

const DocumentViewerPortfolio = ({ documents, currentPath }: { documents: any[]; currentPath: string }) => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase();
  };

  const isPreviewable = (fileName: string) => {
    const ext = getFileExtension(fileName);
    return ['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(ext);
  };

  const handlePreview = async (document: any) => {
    if (!isPreviewable(document.name)) {
      // For non-previewable files, just set as selected
      setSelectedDocument(document);
      setPreviewUrl(null);
      return;
    }

    setLoadingPreview(true);
    setSelectedDocument(document);

    try {
      const { data, error } = await supabase
        .storage
        .from('Images')
        .createSignedUrl(`${currentPath}${document.name}`, 3600); // URL valid for 1 hour

      if (error) {
        throw error;
      }

      setPreviewUrl(data.signedUrl);
    } catch (error) {
      console.error('Error generating preview URL:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('Images')
        .createSignedUrl(`${currentPath}${doc.name}`, 3600); // URL valid for 1 hour

      if (error) {
        throw error;
      }

      // Check if we're in the browser environment
      if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
        // Create a temporary link and trigger download
        const link = window.document.createElement('a');
        link.href = data.signedUrl;
        link.download = doc.name; // This attribute forces download
        window.document.body.appendChild(link);
        link.click();
        // Remove the link after a short delay to ensure the download is triggered
        setTimeout(() => {
          window.document.body.removeChild(link);
        }, 100);
      } else {
        // Fallback: open the URL directly (only in browser)
        console.error('Download can only be triggered in a browser environment');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      // Provide feedback to the user
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  return (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto pr-2">
        {documents
          .filter(doc => !doc.name.startsWith('.folder-placeholder')) // Filter out placeholder files
          .map((doc, index) => (
          <div
            key={index}
            className={`p-3 border rounded-lg mb-2 flex justify-between items-center ${
              selectedDocument?.name === doc.name ? 'bg-blue-50 border-blue-300' : 'bg-slate-700/70 border-slate-600'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-200 truncate">{doc.name}</p>
              <p className="text-xs text-slate-400">
                {new Date(doc.created_at).toLocaleDateString()} • {formatFileSize(doc.size)}
              </p>
            </div>
            <div className="flex space-x-2 ml-2">
              <button
                onClick={() => handlePreview(doc)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 transition-colors"
              >
                View
              </button>
              <button
                onClick={() => handleDownload(doc)}
                className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-500 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedDocument && (
        <div className="mt-6 bg-slate-900/80 rounded-lg p-4 border border-slate-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-slate-200 text-lg">Preview: {selectedDocument.name}</h3>
            <button
              onClick={() => {
                setSelectedDocument(null);
                setPreviewUrl(null);
              }}
              className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {loadingPreview ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-cyan"></div>
            </div>
          ) : previewUrl ? (
            <div className="rounded overflow-hidden">
              {getFileExtension(selectedDocument.name) === 'pdf' ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-96 border border-slate-600 rounded"
                  title="Document Preview"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt={selectedDocument.name}
                  className="max-w-full h-auto border border-slate-600 rounded"
                />
              )}
            </div>
          ) : (
            <div className="p-6 bg-slate-800/50 rounded text-center border border-slate-700">
              <p className="text-slate-400">
                This file type cannot be previewed. Please download to view.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentViewerPortfolio;