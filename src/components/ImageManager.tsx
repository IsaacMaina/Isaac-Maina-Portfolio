// src/components/ImageManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { createBrowserClient } from '@supabase/ssr';

interface ImageFile {
  id: string;
  name: string;
  path: string;
  publicUrl: string;
  size: number;
  uploadedAt: string;
}

export default function ImageManager() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);

      // Use the Supabase client directly from the browser
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get all items in profile-images folder
      const { data: files, error } = await supabase.storage
        .from('Images') // Using the 'Images' bucket
        .list('profile-images/', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error('Error fetching profile images from Supabase:', error);
        throw new Error('Failed to fetch profile images');
      }

      if (!files) {
        setImages([]);
        return;
      }

      // Process the file list to create the appropriate response
      const profileImages = files
        .filter(file => file.id !== null) // Filter out folders (they usually have id: null)
        .map(file => {
          const filePath = `profile-images/${file.name}`;
          const { data: { publicUrl } } = supabase.storage
            .from('Images')
            .getPublicUrl(filePath);

          return {
            id: file.id || file.name, // Use file name as fallback if id is null
            name: file.name,
            path: filePath,
            publicUrl: publicUrl,
            size: file.metadata?.size || 0,
            uploadedAt: file.created_at || new Date().toISOString(),
          };
        });

      setImages(profileImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm(`Are you sure you want to delete this image: ${path}?`)) {
      return;
    }

    try {
      setDeleting(path);

      // Use the Supabase client directly from the browser for deletion
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase.storage
        .from('Images')
        .remove([path]);

      if (error) {
        throw new Error('Failed to delete image from Supabase');
      }

      // Remove the deleted image from the local state
      setImages(prev => prev.filter(img => img.path !== path));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No profile images found in Supabase.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((image) => (
        <motion.div
          key={image.path}
          className="bg-slate-800 rounded-xl overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="aspect-square relative">
            <img
              src={image.publicUrl}
              alt={image.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium truncate" title={image.name}>
              {image.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 truncate" title={image.path}>
              {image.path}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {(image.size / 1024).toFixed(1)} KB
            </p>
            <button
              onClick={() => handleDelete(image.path)}
              disabled={deleting === image.path}
              className={`mt-3 w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                deleting === image.path
                  ? 'bg-red-600/50 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {deleting === image.path ? 'Deleting...' : 'Delete Image'}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}