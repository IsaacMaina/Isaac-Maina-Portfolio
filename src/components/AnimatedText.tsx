'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const AnimatedText = () => {
  const skills = ['Web Developer', 'IT Support', 'Data Analyst', 'Full Stack Developer', 'UI/UX Designer'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user prefers reduced motion
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleMediaChange = (e) => {
        setReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleMediaChange);

      // Check if mobile
      setIsMobile(window.innerWidth < 768);

      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        mediaQuery.removeEventListener('change', handleMediaChange);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  useEffect(() => {
    // If user prefers reduced motion, skip the typing animation
    if (reducedMotion) {
      setCurrentText(skills[0]);
      return;
    }

    // Adjust typing speed based on device and user preferences
    const baseSpeed = isMobile ? 200 : 150; // Slower on mobile
    const currentSkill = skills[currentIndex];

    if (isDeleting) {
      // Deleting text
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentSkill.substring(0, currentText.length - 1));
          setTypingSpeed(baseSpeed * 0.75); // Slightly faster when deleting
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next skill
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % skills.length);
        setTypingSpeed(baseSpeed * 1.5);
      }
    } else {
      // Typing text
      if (currentText.length < currentSkill.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentSkill.substring(0, currentText.length + 1));
          setTypingSpeed(baseSpeed);
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait then start deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
          setTypingSpeed(baseSpeed);
        }, isMobile ? 3000 : 2000); // Longer pause on mobile
        return () => clearTimeout(timeout);
      }
    }
  }, [currentText, isDeleting, currentIndex, typingSpeed, skills, isMobile, reducedMotion]);

  return (
    <motion.span
      className="text-accent-cyan inline-block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {currentText}
      {!reducedMotion && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
          className="ml-1 text-2xl md:text-3xl xl:text-4xl"
        >
          |
        </motion.span>
      )}
      {reducedMotion && <span className="ml-1">|</span>}
    </motion.span>
  );
};

export default AnimatedText;