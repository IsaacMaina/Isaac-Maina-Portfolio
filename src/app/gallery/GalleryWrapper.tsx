'use client';

import { useState } from 'react';
import GalleryItemsClient from './GalleryItemsClient';
import GalleryFilters from './GalleryFilters';

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

interface GalleryWrapperProps {
  galleryAlbums: GalleryAlbum[];
}

export default function GalleryWrapper({ galleryAlbums }: GalleryWrapperProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Filter albums based on active category
  const filteredAlbums = activeCategory === 'All' 
    ? galleryAlbums 
    : galleryAlbums.filter(album => album.name.toLowerCase() === activeCategory.toLowerCase());

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  return (
    <>
      <GalleryFilters 
        albums={galleryAlbums.map(album => ({ name: album.name }))} 
        onCategoryChange={handleCategoryChange}
      />
      <GalleryItemsClient 
        galleryAlbums={galleryAlbums} 
        activeCategory={activeCategory}
      />
    </>
  );
}