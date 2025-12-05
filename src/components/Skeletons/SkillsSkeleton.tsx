// components/Skeletons/SkillsSkeleton.tsx
'use client';

import { motion } from 'framer-motion';

export default function SkillsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-4xl font-bold mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My <span className="text-accent-cyan">Skills</span>
        </motion.div>

        <div className="space-y-16">
          {/* Skill categories skeleton */}
          {[...Array(3)].map((_, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
            >
              <div className="h-8 bg-slate-700 rounded w-1/3 mb-8 animate-pulse"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(5)].map((_, skillIndex) => (
                  <motion.div
                    key={skillIndex}
                    className="bg-slate-800 rounded-2xl p-6"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="h-5 bg-slate-700 rounded w-1/3 animate-pulse"></div>
                      <div className="h-5 bg-slate-700 rounded w-8 animate-pulse"></div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 animate-pulse"></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Additional skills section skeleton */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-8 animate-pulse"></div>
            <div className="flex flex-wrap justify-center gap-4">
              {[...Array(8)].map((_, index) => (
                <motion.div
                  key={index}
                  className="h-10 bg-slate-700 rounded-full min-w-[100px] animate-pulse"
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17
                  }}
                >
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}