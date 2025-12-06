'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

// Define animation variants with multiple options
const animationVariants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  slideUp: {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  slideDown: {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  },
  slideLeft: {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  slideRight: {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  },
  zoomIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  },
  scaleIn: {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  }
};

interface ScrollAnimatedElementProps {
  children: React.ReactNode;
  variant?: keyof typeof animationVariants;
  delay?: number;
  duration?: number;
  threshold?: number; // Intersection Observer threshold
  once?: boolean; // Whether animation should happen only once
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements; // To allow rendering as different HTML elements
}

export default function ScrollAnimatedElement({
  children,
  variant = 'slideUp',
  delay = 0,
  duration = 0.5,
  threshold = 0.1,
  once = true,
  className = '',
  style = {},
  as = 'div'
}: ScrollAnimatedElementProps) {
  const elementRef = useRef(null);
  const isInView = useInView(elementRef, { 
    margin: "-100px 0px", 
    threshold,
    once
  });
  
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [controls, isInView, once]);

  const Element = as as React.ElementType;

  return (
    <Element 
      ref={elementRef}
      className={className}
      style={style}
    >
      <motion.div
        variants={animationVariants[variant]}
        initial="hidden"
        animate={controls}
        transition={{ 
          delay, 
          duration,
          ease: "easeOut"
        }}
      >
        {children}
      </motion.div>
    </Element>
  );
}