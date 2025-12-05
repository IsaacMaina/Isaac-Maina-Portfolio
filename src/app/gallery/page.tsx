import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import GalleryWrapper from './GalleryWrapper';
import { getGalleryAlbumsFromStorage } from '@/lib/supabase/gallery-service';

export default async function GalleryPage() {
  // Fetch gallery albums from Supabase storage on the server
  const galleryAlbums = await getGalleryAlbumsFromStorage();

  console.log(`Gallery page: Loaded ${galleryAlbums.length} albums from storage`);

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection
          className="text-4xl font-bold mb-4 text-center"
          animationType="fade"
        >
          Photo <span className="text-accent-cyan">Gallery</span>
        </AnimatedSection>

        <AnimatedSection
          className="text-xl text-slate-400 mb-12 text-center max-w-3xl mx-auto"
          animationType="fade"
          delay={0.1}
        >
          A collection of moments from my professional journey, certifications, events, and personal interests.
        </AnimatedSection>

        {galleryAlbums.length > 0 ? (
          <GalleryWrapper galleryAlbums={galleryAlbums} />
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-slate-400 mb-4">No gallery albums available</h3>
            <p className="text-slate-500">Check that you have folders inside the 'gallery' folder in your Supabase Images bucket</p>
            <p className="text-slate-400 text-sm mt-2">Each subfolder in 'gallery/' is treated as an album</p>
          </div>
        )}
      </div>
    </div>
  );
}