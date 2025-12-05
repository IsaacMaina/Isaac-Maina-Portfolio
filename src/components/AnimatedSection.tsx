'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

type AnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animationType?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right';
  once?: boolean; // Run animation only once
  threshold?: number; // Intersection threshold
};

const AnimatedSection = ({
  children,
  className = '',
  delay = 0,
  animationType = 'slide-up',
  once = true,
  threshold = 0.1,
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once,
    threshold
  });

  const getAnimation = () => {
    switch (animationType) {
      case 'fade':
        return {
          opacity: isInView ? 1 : 0,
          transition: { delay, duration: 0.6 },
        };
      case 'slide-down':
        return {
          opacity: isInView ? 1 : 0,
          y: isInView ? 0 : 50,
          transition: { delay, duration: 0.6 },
        };
      case 'slide-left':
        return {
          opacity: isInView ? 1 : 0,
          x: isInView ? 0 : -50,
          transition: { delay, duration: 0.6 },
        };
      case 'slide-right':
        return {
          opacity: isInView ? 1 : 0,
          x: isInView ? 0 : 50,
          transition: { delay, duration: 0.6 },
        };
      case 'slide-up':
      default:
        return {
          opacity: isInView ? 1 : 0,
          y: isInView ? 0 : 50,
          transition: { delay, duration: 0.6 },
        };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? getAnimation() : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;