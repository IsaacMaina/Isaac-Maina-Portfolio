"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Skills", path: "/skills" },
    { name: "Projects", path: "/projects" },
    { name: "Gallery", path: "/gallery" },
    { name: "Documents", path: "/documents" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="py-6 px-4 sm:px-8 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold text-accent-cyan"
        >
          <Link href="/">Isaac Maina</Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-1 sm:space-x-2 lg:space-x-4">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  href={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    pathname === link.path
                      ? "bg-accent-cyan text-slate-900"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.name}
                  </motion.span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-300 hover:text-white focus:outline-none"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <FiX className="h-6 w-6 text-white" />
            ) : (
              <FiMenu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={false}
        animate={{ height: isMenuOpen ? "auto" : "0" }}
        transition={{ duration: 0.3 }}
        className={`overflow-hidden md:hidden ${
          isMenuOpen ? "pb-6" : ""
        }`}
      >
        <ul className="space-y-3 px-4">
          {navLinks.map((link) => (
            <li key={link.path} className="w-full">
              <Link
                href={link.path}
                className={`w-full block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                  pathname === link.path
                    ? "bg-accent-cyan text-slate-900"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    </header>
  );
};

export default Header;