"use client";

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";

interface Album {
  name: string;
}

interface GalleryFiltersProps {
  albums?: Album[];
  onCategoryChange?: (category: string) => void;
}

export default function GalleryFilters({ albums = [], onCategoryChange }: GalleryFiltersProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    // Extract unique categories from the albums prop
    const uniqueCategories = Array.from(new Set(albums.map(album => album.name)));
    setCategories(['All', ...uniqueCategories]);
  }, [albums]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <div className="flex justify-center mb-12">
      <div className="flex flex-wrap gap-2">
        {categories.length > 0 ? categories.map((filter, index) => (
          <motion.button
            key={`filter-${index}-${filter}`} // Using a composite key to ensure uniqueness
            className={`px-4 py-2 rounded-full transition-colors cursor-pointer ${
              activeCategory === filter
                ? 'bg-accent-cyan text-slate-900'
                : 'bg-slate-800 hover:bg-accent-cyan hover:text-slate-900'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryClick(filter)}
          >
            {filter}
          </motion.button>
        )) : (
          ["All", "Work", "Events", "Personal", "Certificates"].map((filter, index) => (
            <motion.button
              key={`default-filter-${index}-${filter}`}
              className={`px-4 py-2 rounded-full transition-colors cursor-pointer ${
                activeCategory === filter
                  ? 'bg-accent-cyan text-slate-900'
                  : 'bg-slate-800 hover:bg-accent-cyan hover:text-slate-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoryClick(filter)}
            >
              {filter}
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}