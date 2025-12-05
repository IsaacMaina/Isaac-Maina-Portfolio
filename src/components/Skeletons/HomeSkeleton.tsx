// components/Skeletons/HomeSkeleton.tsx
'use client';

import { motion } from 'framer-motion';

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section skeleton */}
        <section className="py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="h-8 bg-slate-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-12 bg-slate-700 rounded w-full animate-pulse"></div>
              <div className="h-6 bg-slate-700 rounded w-5/6 animate-pulse"></div>
              <div className="space-y-3 pt-4">
                <div className="h-4 bg-slate-700 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3 animate-pulse"></div>
              </div>
              <div className="flex flex-wrap gap-4 pt-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-accent-cyan rounded-lg w-24 animate-pulse"></div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="h-80 w-80 bg-slate-700 rounded-full animate-pulse"></div>
            </motion.div>
          </div>
        </section>

        {/* Skills section skeleton */}
        <section className="py-16">
          <div className="h-8 bg-slate-700 rounded w-1/3 mx-auto animate-pulse mb-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                      <div className="h-2 bg-slate-700 rounded-full w-1/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Additional skills section */}
          <div className="mt-12">
            <div className="h-6 bg-slate-700 rounded w-1/4 mx-auto animate-pulse mb-6"></div>
            <div className="flex flex-wrap justify-center gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-700 rounded-full px-6 animate-pulse"></div>
              ))}
            </div>
          </div>
        </section>

        {/* Other sections skeleton */}
        <section className="py-16">
          <div className="h-8 bg-slate-700 rounded w-1/3 mx-auto animate-pulse mb-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-48 bg-slate-700 rounded-xl mb-4 animate-pulse"></div>
                <div className="h-6 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-6 bg-slate-700 rounded-full px-3 animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}