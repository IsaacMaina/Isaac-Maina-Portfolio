"use client";

import { useState } from 'react';
import { motion } from "framer-motion";
import SupabaseImage from "@/components/SupabaseImage";
import AnimatedSection from "@/components/AnimatedSection";
import ScrollAnimatedElement from "@/components/ScrollAnimatedElement";

// Define the gallery item structure based on the database schema
interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  category: string;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the gallery album structure
interface GalleryAlbum {
  name: string;
  items: GalleryItem[];
}

interface GalleryItemsProps {
  galleryAlbums: GalleryAlbum[];
  activeCategory?: string;
}

export default function GalleryItemsClient({ galleryAlbums, activeCategory = 'All' }: GalleryItemsProps) {
  const [expandedAlbums, setExpandedAlbums] = useState<Record<string, boolean>>({});

  const toggleAlbum = (albumName: string) => {
    setExpandedAlbums(prev => ({
      ...prev,
      [albumName]: !prev[albumName]
    }));
  };

  // Filter albums based on active category
  const filteredAlbums = activeCategory === 'All'
    ? galleryAlbums
    : galleryAlbums.filter(album => album.name.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-16">
      {filteredAlbums.map((album, albumIndex) => {
        const isExpanded = expandedAlbums[album.name] || false;
        const itemsToShow = isExpanded ? album.items : album.items.slice(0, 5);
        const hasMore = album.items.length > 5;

        return (
          <AnimatedSection
            key={album.name}
            animationType="slide-up"
            delay={albumIndex * 0.1}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              {album.name.charAt(0).toUpperCase() + album.name.slice(1)} Album
            </h2>

            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {itemsToShow.map((item, index) => (
                <ScrollAnimatedElement
                  key={item.id}
                  variant="slideUp"
                  delay={index * 0.1}
                  className="mb-6 break-inside-avoid"
                >
                  <motion.div
                    className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative aspect-square">
                      <SupabaseImage
                        filePath={item.src}
                        alt={item.alt || `Gallery item ${item.id}`}
                        className="w-full h-full object-cover cursor-pointer"
                      />
                    </div>
                  </motion.div>
                </ScrollAnimatedElement>
              ))}
            </div>

            {hasMore && !isExpanded && (
              <div className="text-center mt-6">
                <button
                  onClick={() => toggleAlbum(album.name)}
                  className="px-6 py-2 bg-accent-cyan text-slate-900 rounded-full font-medium hover:bg-opacity-90 transition-colors"
                >
                  Show More
                </button>
              </div>
            )}

            {isExpanded && hasMore && (
              <div className="text-center mt-6">
                <button
                  onClick={() => toggleAlbum(album.name)}
                  className="px-6 py-2 bg-slate-700 text-white rounded-full font-medium hover:bg-slate-600 transition-colors"
                >
                  Show Less
                </button>
              </div>
            )}
          </AnimatedSection>
        );
      })}

      {/* Featured section - show first image from each album */}
      {filteredAlbums.length > 0 && (
        <AnimatedSection
          className="mt-16"
          animationType="slide-up"
          delay={0.5}
        >
          <h2 className="text-2xl font-bold mb-8 text-center">Featured Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredAlbums.map((album, index) => {
              const firstItem = album.items[0];
              if (!firstItem) return null;

              return (
                <ScrollAnimatedElement
                  key={`featured-${album.name}`}
                  variant="scaleIn"
                  delay={index * 0.1}
                >
                  <motion.div
                    className="rounded-xl overflow-hidden shadow-lg aspect-square hover:shadow-2xl transition-shadow duration-300 relative"
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SupabaseImage
                      filePath={firstItem.src}
                      alt={firstItem.alt || `Featured in ${album.name}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </ScrollAnimatedElement>
              );
            })}
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}