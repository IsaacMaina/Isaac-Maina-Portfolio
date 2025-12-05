// src/lib/gallery-categories-service.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Function to get all available categories from Supabase storage
export async function getGalleryCategoriesFromStorage(): Promise<string[]> {
  try {
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

    // List items in the gallery folder to get subfolders
    const { data, error } = await supabase.storage
      .from('Images')
      .list('gallery/', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      console.error('Error fetching gallery categories from Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No gallery subfolders found in Supabase');
      return [];
    }

    // Extract unique category names from folder structure: gallery/categoryName/image.jpg
    const categoriesSet = new Set<string>();

    for (const item of data) {
      // Check if it's a file within a folder (e.g., certificates/image.jpg)
      if (item.name.includes('/')) {
        // Extract the category (first part of the path) from files in subfolders
        const category = item.name.split('/')[0];
        categoriesSet.add(category);
      }
      // Note: Direct files in the gallery folder won't have a category from folder structure
    }

    // Convert set to array and sort
    return Array.from(categoriesSet).sort();
  } catch (error) {
    console.error('Unexpected error in getGalleryCategoriesFromStorage:', error);
    return [];
  }
}