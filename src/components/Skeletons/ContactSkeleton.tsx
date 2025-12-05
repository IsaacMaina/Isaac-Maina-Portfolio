// components/Skeletons/ContactSkeleton.tsx
'use client';

import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';

export default function ContactSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection
          className="text-4xl font-bold mb-4 text-center"
          animationType="fade"
        >
          Get In <span className="text-accent-cyan">Touch</span>
        </AnimatedSection>

        <AnimatedSection
          className="text-xl text-slate-400 mb-12 text-center max-w-3xl mx-auto"
          animationType="fade"
          delay={0.1}
        >
          <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto animate-pulse mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto animate-pulse"></div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form Skeleton */}
          <AnimatedSection
            animationType="slide-right"
            delay={0.2}
          >
            <motion.div
              className="bg-slate-800 rounded-2xl p-8"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-6 bg-slate-700 rounded w-1/3 mb-6 animate-pulse"></div>

              {/* Form fields skeleton */}
              <div className="space-y-6">
                <div>
                  <div className="h-4 bg-slate-700 rounded w-1/4 mb-2 animate-pulse"></div>
                  <div className="h-12 bg-slate-700 rounded-lg animate-pulse"></div>
                </div>

                <div>
                  <div className="h-4 bg-slate-700 rounded w-1/4 mb-2 animate-pulse"></div>
                  <div className="h-12 bg-slate-700 rounded-lg animate-pulse"></div>
                </div>

                <div>
                  <div className="h-4 bg-slate-700 rounded w-1/4 mb-2 animate-pulse"></div>
                  <div className="h-32 bg-slate-700 rounded-lg animate-pulse"></div>
                </div>

                <div className="h-12 bg-slate-700 rounded-lg animate-pulse"></div>
              </div>
            </motion.div>
          </AnimatedSection>

          {/* Contact Information Skeleton */}
          <AnimatedSection
            animationType="slide-left"
            delay={0.2}
          >
            <motion.div
              className="bg-slate-800 rounded-2xl p-8"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="h-6 bg-slate-700 rounded w-1/3 mb-6 animate-pulse"></div>

              <div className="space-y-6">
                {[...Array(4)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center p-4 bg-slate-700 rounded-lg animate-pulse"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-slate-600 rounded-full mr-4 animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-slate-600 rounded w-1/2 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-slate-600 rounded w-3/4 animate-pulse"></div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10">
                <div className="h-6 bg-slate-700 rounded w-1/4 mb-4 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2 mb-2 animate-pulse"></div>

                {/* Map container skeleton */}
                <motion.div
                  className="mt-6 bg-slate-700 rounded-xl h-48 flex items-center justify-center animate-pulse"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center">
                    <div className="h-8 w-8 bg-slate-600 rounded-full mb-2 animate-pulse mx-auto"></div>
                    <div className="h-4 bg-slate-600 rounded w-1/2 animate-pulse"></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}