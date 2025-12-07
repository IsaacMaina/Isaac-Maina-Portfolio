'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DocumentFolderPage() {
  const router = useRouter();
  const { folder } = useParams();

  useEffect(() => {
    // Redirect to the main documents page with the folder in the path
    // The main documents page will handle displaying the specific folder
    router.replace(`/documents?initialFolder=${folder}`);
  }, [folder, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading folder...</p>
      </div>
    </div>
  );
}