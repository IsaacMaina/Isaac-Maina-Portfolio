// components/Skeletons/ProjectsSkeleton.tsx
'use client';

import { motion } from 'framer-motion';
import AnimatedSection from '@/components/AnimatedSection';

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  link: string;
  stack: string[];
  category: string;
  orderIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function ProjectsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection
          className="text-4xl font-bold mb-12 text-center"
          animationType="fade"
        >
          My <span className="text-accent-cyan">Projects</span>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <AnimatedSection
              key={index}
              animationType="slide-up"
              delay={index * 0.1}
            >
              <motion.div
                className="bg-slate-800 rounded-2xl hover:shadow-xl transition-shadow duration-300 border border-slate-700 animate-pulse"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-5 bg-slate-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-slate-700 rounded-full w-24"></div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-4/5"></div>
                    <div className="h-4 bg-slate-700 rounded w-3/5"></div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-6 bg-slate-700 rounded-full px-3"
                      ></div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="flex-1 h-10 bg-accent-cyan rounded-lg"></div>
                    <div className="flex-1 h-10 bg-slate-700 rounded-lg"></div>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}