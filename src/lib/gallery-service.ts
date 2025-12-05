// src/lib/gallery-service.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';

// Define the gallery item structure
export interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  category: string;
  name: string; // The file name in Supabase
}

// Fetch gallery images from Supabase
export const getGalleryItems = cache(async (): Promise<GalleryItem[]> => {
  try {
    // Create server-side Supabase client to access storage
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // List files in the gallery folder
    const { data: files, error } = await supabase.storage
      .from('Images')
      .list('gallery/', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error('Error fetching gallery images from Supabase:', error);
      return [];
    }

    if (!files || files.length === 0) {
      console.log('No gallery images found in Supabase');
      return [];
    }

    // Generate public URLs for each image
    const galleryItems: GalleryItem[] = await Promise.all(
      files.map(async (file, index) => {
        const filePath = `gallery/${file.name}`;
        const { data: { publicUrl } } = supabase.storage
          .from('Images')
          .getPublicUrl(filePath);

        return {
          id: index + 1,
          src: publicUrl,
          alt: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for alt text
          category: 'gallery', // All images are in the gallery category
          name: file.name
        };
      })
    );

    return galleryItems;
  } catch (error) {
    console.error('Unexpected error in getGalleryItems:', error);
    // Return fallback images if there's an error
    return [
      { id: 1, src: "/gallery/certificate1.jpg", alt: "Certificate 1", category: "certificates", name: "certificate1.jpg" },
      { id: 2, src: "/gallery/certificate2.jpg", alt: "Certificate 2", category: "certificates", name: "certificate2.jpg" },
      { id: 3, src: "/gallery/work1.jpg", alt: "Work 1", category: "work", name: "work1.jpg" },
    ];
  }
});