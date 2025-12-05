// components/Skeletons/GallerySkeleton.tsx
'use client';

import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';

export default function GallerySkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection
          className="text-4xl font-bold mb-12 text-center"
          animationType="fade"
        >
          My <span className="text-accent-cyan">Gallery</span>
        </AnimatedSection>

        {/* Gallery filters skeleton */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, index) => (
              <motion.button
                key={index}
                className="px-4 py-2 bg-slate-800 rounded-full transition-colors cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="h-4 bg-slate-700 rounded w-20 animate-pulse"></div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Gallery items skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, index) => (
            <motion.div
              key={index}
              className="aspect-square rounded-2xl overflow-hidden shadow-lg bg-slate-800 animate-pulse"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                <div className="h-12 w-12 bg-slate-600 rounded-full animate-pulse"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured section skeleton */}
        <AnimatedSection
          className="mt-16"
          animationType="slide-up"
          delay={0.5}
        >
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-8 animate-pulse mx-auto"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <motion.div
                key={`featured-${index}`}
                className="rounded-xl overflow-hidden shadow-lg aspect-square bg-slate-800 animate-pulse"
                whileHover={{ scale: 1.05, rotate: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <div className="h-8 w-8 bg-slate-600 rounded-full animate-pulse"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-slate-900/80 p-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto animate-pulse"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}