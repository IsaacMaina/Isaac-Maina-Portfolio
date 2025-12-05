// components/LoadingSpinner.tsx
'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const spinnerSize = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        className={`${spinnerSize} border-t-2 border-b-2 border-accent-cyan rounded-full animate-spin`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      ></motion.div>
      {message && (
        <motion.p 
          className="mt-4 text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}