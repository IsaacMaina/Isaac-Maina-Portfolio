"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FiMenu, FiX, FiLogIn, FiLogOut } from "react-icons/fi";
import { useSession, signIn, signOut } from "next-auth/react";

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { data: session, status } = useSession(); // Get session data

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle scroll events to close menu when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - close menu if open
        if (isMenuOpen) {
          setIsMenuOpen(false);
        }
      }

      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Skills", path: "/skills" },
    { name: "Projects", path: "/projects" },
    { name: "Gallery", path: "/gallery" },
    { name: "Documents", path: "/documents" },
    { name: "Contact", path: "/contact" },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuButton = document.querySelector('.mobile-menu-button');
      const mobileMenu = document.querySelector('.mobile-menu');

      if (isMenuOpen && menuButton && mobileMenu &&
          !menuButton.contains(event.target as Node) &&
          !mobileMenu.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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
          <ul className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
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

            {/* Login/Logout button for desktop */}
            <li>
              {status === 'loading' ? (
                <div className="px-3 py-2 text-slate-300">Loading...</div>
              ) : status === 'authenticated' ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/admin/dashboard"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-rose-700 text-white hover:bg-rose-600 transition-colors flex items-center"
                  >
                    <FiLogOut className="mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-emerald-700 text-white hover:bg-emerald-600 transition-colors flex items-center"
                >
                  <FiLogIn className="mr-1" />
                  Login
                </button>
              )}
            </li>
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden mobile-menu-button">
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
        className={`overflow-hidden md:hidden mobile-menu ${
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

          {/* Mobile Login/Logout options */}
          {status === 'loading' ? (
            <li className="w-full">
              <div className="w-full block px-4 py-3 rounded-lg text-base font-medium text-slate-300">
                Loading...
              </div>
            </li>
          ) : status === 'authenticated' ? (
            <>
              <li className="w-full">
                <Link
                  href="/admin/dashboard"
                  className="w-full block px-4 py-3 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>
              <li className="w-full">
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left block px-4 py-3 rounded-lg text-base font-medium bg-rose-700 text-white hover:bg-rose-600 transition-colors"
                >
                  <FiLogOut className="inline mr-2" />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="w-full">
              <button
                onClick={() => {
                  signIn();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left block px-4 py-3 rounded-lg text-base font-medium bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
              >
                <FiLogIn className="inline mr-2" />
                Login
              </button>
            </li>
          )}
        </ul>
      </motion.div>
    </header>
  );
};

export default Header;