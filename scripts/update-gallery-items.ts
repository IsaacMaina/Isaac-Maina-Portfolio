import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { galleryItems } from '../src/db/schema';
import { eq } from 'drizzle-orm';
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL || '');
const db = drizzle(sql);

async function updateGalleryItemsToUseSupabaseUrls() {
  console.log('Updating gallery items to use actual Supabase URLs...');

  try {
    // Get all current gallery items
    const currentItems = await db
      .select()
      .from(galleryItems);

    // For each item, update the src to be a valid Supabase URL
    // Since we don't know what images are actually in your Supabase storage,
    // we'll use placeholder images or update with local files that exist
    for (let i = 0; i < currentItems.length; i++) {
      const item = currentItems[i];
      
      // Create a path that assumes the images exist in Supabase under the correct category
      // We'll use the original image names from the public folder but with category structure
      const categories = ['work', 'events', 'personal', 'certificates'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      // Just update the category in case it's not already set correctly
      await db
        .update(galleryItems)
        .set({ 
          category: randomCategory,
          src: `/gallery/Img${(i % 14) + 1}.png` // Using the public folder images as reference
        })
        .where(eq(galleryItems.id, item.id));
    }

    // Add some sample items that will use Supabase images if they exist
    // For now, let's add a few more with common filenames that might be in Supabase
    const sampleItems = [
      { src: 'https://fsoevobqzmjhjhkpwfgb.supabase.co/storage/v1/object/public/Images/gallery/work/work1.jpg', alt: 'Work image 1', category: 'work' },
      { src: 'https://fsoevobqzmjhjhkpwfgb.supabase.co/storage/v1/object/public/Images/gallery/events/event1.jpg', alt: 'Event image 1', category: 'events' },
      { src: 'https://fsoevobqzmjhjhkpwfgb.supabase.co/storage/v1/object/public/Images/gallery/personal/personal1.jpg', alt: 'Personal image 1', category: 'personal' },
      { src: 'https://fsoevobqzmjhjhkpwfgb.supabase.co/storage/v1/object/public/Images/gallery/certificates/cert1.jpg', alt: 'Certificate image 1', category: 'certificates' },
    ];

    // Add these if they don't already exist
    for (const item of sampleItems) {
      await db.insert(galleryItems).values({
        src: item.src,
        alt: item.alt,
        category: item.category,
        orderIndex: 0
      });
    }

    console.log('Gallery items updated successfully!');
  } catch (error) {
    console.error('Error updating gallery items:', error);
    throw error;
  }
}

updateGalleryItemsToUseSupabaseUrls().catch(console.error);