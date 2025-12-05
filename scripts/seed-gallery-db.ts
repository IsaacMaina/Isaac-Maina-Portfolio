import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { galleryItems } from '../src/db/schema';
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL || '');
const db = drizzle(sql);

async function seedGalleryItems() {
  console.log('Seeding gallery items to database...');

  // Define gallery items with random categories
  const categories = ['work', 'events', 'personal', 'certificates'];
  const galleryItemsData = [
    { id: 1, src: '/gallery/work1.jpg', alt: 'Working at desk', category: 'work' },
    { id: 2, src: '/gallery/event1.jpg', alt: 'Tech conference', category: 'events' },
    { id: 3, src: '/gallery/personal1.jpg', alt: 'Personal photo', category: 'personal' },
    { id: 4, src: '/gallery/certificate1.jpg', alt: 'Google Technical Support Certificate', category: 'certificates' },
    { id: 5, src: '/gallery/work2.jpg', alt: 'Coding session', category: 'work' },
    { id: 6, src: '/gallery/event2.jpg', alt: 'Team collaboration', category: 'events' },
    { id: 7, src: '/gallery/personal2.jpg', alt: 'Another personal photo', category: 'personal' },
    { id: 8, src: '/gallery/certificate2.jpg', alt: 'IBM Database Certificate', category: 'certificates' },
  ];

  try {
    // First delete existing gallery items
    await db.delete(galleryItems);

    // Add new gallery items with random categories
    for (let i = 0; i < 14; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const item = {
        src: `/gallery/Img${i+1}.png`,  // Using the local image path as placeholder
        alt: `Gallery image ${i+1}`,
        category: randomCategory,
        orderIndex: i
      };
      
      await db.insert(galleryItems).values(item);
    }

    console.log('Gallery items seeded successfully!');
  } catch (error) {
    console.error('Error seeding gallery items:', error);
    throw error;
  }
}

seedGalleryItems().catch(console.error);