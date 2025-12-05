// components/Skeletons/DocumentsSkeleton.tsx
'use client';

import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';

export default function DocumentsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection
          className="text-4xl font-bold mb-12 text-center"
          animationType="fade"
        >
          <span className="text-accent-cyan">Document Explorer</span>
        </AnimatedSection>

        <p className="text-xl text-slate-400 mb-12 text-center max-w-3xl mx-auto">
          Exploring my professional documents organized by folder and file structure.
        </p>

        {/* Document filters skeleton */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, index) => (
              <motion.button
                key={index}
                className="px-4 py-2 bg-slate-800 rounded-full transition-colors cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="h-4 bg-slate-700 rounded w-16 animate-pulse"></div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Document albums skeleton */}
        <div className="space-y-16">
          {[...Array(3)].map((_, albumIndex) => (
            <AnimatedSection
              key={albumIndex}
              animationType="slide-up"
              delay={albumIndex * 0.1}
            >
              <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <div className="h-8 bg-slate-700 rounded w-1/3 mb-8 animate-pulse mx-auto"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(4)].map((_, docIndex) => (
                    <motion.div
                      key={docIndex}
                      className="bg-slate-900/80 rounded-xl p-4 border border-slate-700 animate-pulse"
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="bg-slate-700 p-3 rounded-lg">
                            <div className="h-6 w-6 bg-slate-600 rounded animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="h-5 bg-slate-700 rounded w-3/4 mb-2 animate-pulse"></div>
                          <div className="h-4 bg-slate-700 rounded w-1/2 mb-3 animate-pulse"></div>
                          
                          {/* Document actions skeleton */}
                          <div className="flex space-x-2 mt-3">
                            <div className="h-6 bg-slate-700 rounded w-16 animate-pulse"></div>
                            <div className="h-6 bg-slate-700 rounded w-16 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Load more button skeleton */}
                <div className="text-center mt-6">
                  <div className="h-10 bg-slate-700 rounded-full px-6 animate-pulse inline-block"></div>
                </div>
              </div>
            </AnimatedSection>
          ))}

          {/* Featured Documents skeleton */}
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
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 animate-pulse"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-slate-700 p-3 rounded-lg mb-3">
                      <div className="h-6 w-6 bg-slate-600 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2 animate-pulse"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}