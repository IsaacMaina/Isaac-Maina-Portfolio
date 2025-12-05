// components/Skeletons/AboutSkeleton.tsx
'use client';

import { motion } from 'framer-motion';

export default function AboutSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-4xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          About <span className="text-accent-cyan">Me</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile card skeleton */}
          <motion.div
            className="bg-slate-800 rounded-2xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-40 h-40 bg-slate-700 rounded-full mb-6 animate-pulse"></div>
              <div className="h-6 bg-slate-700 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-5 bg-slate-700 rounded w-1/2 mb-4 animate-pulse"></div>
              
              <div className="space-y-2 w-full mt-4 text-left">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex">
                    <div className="h-4 bg-slate-700 rounded w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3 ml-2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bio and experience skeleton */}
          <motion.div
            className="lg:col-span-2 space-y-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Biography skeleton */}
            <div>
              <div className="h-6 bg-slate-700 rounded w-1/4 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Education skeleton */}
            <div>
              <div className="h-6 bg-slate-700 rounded w-1/4 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border-l-4 border-accent-cyan pl-4 py-2 animate-pulse">
                    <div className="h-5 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2 mt-2 animate-pulse"></div>
                    <div className="h-4 bg-slate-700 rounded w-full mt-2 animate-pulse"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3 mt-2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience skeleton */}
            <div>
              <div className="h-6 bg-slate-700 rounded w-1/4 mb-4 animate-pulse"></div>
              <div className="relative space-y-8">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="relative pl-12 animate-pulse">
                    <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center transform -translate-x-1/2"></div>
                    <div className="h-5 bg-slate-700 rounded w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/3 mt-2 animate-pulse"></div>
                    <div className="h-4 bg-slate-700 rounded w-full mt-2 animate-pulse"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3 mt-2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications skeleton */}
            <div>
              <div className="h-6 bg-slate-700 rounded w-1/4 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 bg-slate-800 rounded-xl animate-pulse">
                    <div className="h-5 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2 mt-2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}