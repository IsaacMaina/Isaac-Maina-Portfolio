'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';
import DocumentViewerPortfolio from './DocumentViewerPortfolio';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DocumentsPage() {
  const { data: session, status } = useSession(); // Get session and status from NextAuth
  const [items, setItems] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState('rootdocs/'); // Changed to match document-reader-app
  const [loading, setLoading] = useState(true);
  const [pathHistory, setPathHistory] = useState<string[]>(['rootdocs/']); // Changed to match document-reader-app

  // Fetch items from Supabase storage
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .storage
          .from('Images')
          .list(currentPath, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
          });

        if (error) {
          console.error('Error fetching items:', error);
        } else {
          setItems(data || []);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [currentPath]);

  const navigateToFolder = (folderName: string) => {
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

    const newPath = currentPath + folderName + '/';
    setCurrentPath(newPath);
    setPathHistory([...pathHistory, newPath]);
  };

  const navigateBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory];
      newHistory.pop(); // Remove current path
      const previousPath = newHistory[newHistory.length - 1];
      setCurrentPath(previousPath);
      setPathHistory(newHistory);
    } else {
      // If at the root, go back to rootdocs/
      setCurrentPath('rootdocs/');
      setPathHistory(['rootdocs/']);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-4 text-center">
          <span className="text-accent-cyan">Document Explorer</span>
        </h1>
        <p className="text-xl text-slate-400 mb-12 text-center max-w-3xl mx-auto">
          Explore my professional documents organized by folder and file structure.
        </p>

        <div className="bg-slate-800/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-200">Document Explorer</h2>
              <p className="text-slate-400 text-sm mt-1">Browse through your document collection</p>
            </div>
            {pathHistory.length > 1 && (
              <button
                onClick={navigateBack}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent-cyan"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display folders */}
              {items.filter(item => item.id === null).length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-300 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    Folders
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.filter(item => item.id === null).map((folder, index) => {
                      const isPrivate = folder.name.toLowerCase() === 'private';
                      const canAccess = isPrivate ? (session && status === 'authenticated') : true;

                      return (
                        <div
                          key={index}
                          className={`p-4 border rounded-lg flex items-center cursor-pointer transition-all duration-200
                            ${isPrivate
                              ? canAccess
                                ? 'bg-emerald-900/30 border-emerald-700 hover:bg-emerald-800/40'
                                : 'bg-rose-900/30 border-rose-700 hover:bg-rose-800/40 cursor-not-allowed'
                              : 'bg-slate-700/50 border-slate-600 hover:bg-slate-600/70'
                            }`}
                          onClick={() => navigateToFolder(folder.name)}
                        >
                          <div className="flex-shrink-0 mr-3">
                            <div className={`p-2 rounded ${isPrivate ? (canAccess ? 'bg-emerald-700' : 'bg-rose-700') : 'bg-slate-600'}`}>
                              {isPrivate ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`truncate block font-medium ${isPrivate ? (canAccess ? 'text-emerald-200' : 'text-rose-200') : 'text-slate-200'}`}>
                              {folder.name}
                            </span>
                            {isPrivate && !canAccess && (
                              <p className="text-xs text-rose-400 mt-1">Authentication required</p>
                            )}
                            {isPrivate && canAccess && (
                              <p className="text-xs text-emerald-400 mt-1">Access granted</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Display files if there are any */}
              {items.filter(item => item.id !== null && !item.name.startsWith('.folder-placeholder')).length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-300 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Files
                  </h3>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <DocumentViewerPortfolio documents={items.filter(item => item.id !== null && !item.name.startsWith('.folder-placeholder'))} currentPath={currentPath} />
                  </div>
                </div>
              )}

              {/* Show message if no items */}
              {items.length === 0 && (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-500 mt-4">No documents in this directory</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}