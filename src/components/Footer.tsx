"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Github,
  Linkedin,
  Twitter as TwitterIcon,
  Instagram,
  Facebook,
  MessageCircle
} from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { name: 'Email', value: 'mainaisaacwachira2000@gmail.com', icon: <Mail size={20} />, href: 'mailto:mainaisaacwachira2000@gmail.com' },
    { name: 'Phone', value: '+254758302725', icon: <Phone size={20} />, href: 'tel:+254758302725' },
    { name: 'WhatsApp', value: '+254758302725', icon: <MessageCircle size={20} />, href: 'https://wa.me/254758302725' },
    { name: 'GitHub', value: 'IsaacMaina', icon: <Github size={20} />, href: 'https://github.com/IsaacMaina' },
    { name: 'LinkedIn', value: 'Isaac Maina', icon: <Linkedin size={20} />, href: 'https://linkedin.com/in/isaac-maina' },
    { name: 'Twitter', value: '@DevIsaacMaina', icon: <TwitterIcon size={20} />, href: 'https://x.com/DevIsaacMaina' },
    { name: 'Instagram', value: '@devisaacmaina', icon: <Instagram size={20} />, href: 'https://instagram.com/devisaacmaina' },
    { name: 'Facebook', value: 'Isaac Maina', icon: <Facebook size={20} />, href: 'https://web.facebook.com/profile.php?id=61576682944507' },
  ];

  return (
    <footer className="py-8 px-4 border-t border-slate-800 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-semibold text-accent-cyan mb-4 md:mb-0"
          >
            <Link href="/">Isaac Maina</Link>
          </motion.div>

          <div className="flex flex-wrap justify-center space-x-4 md:space-x-6 mb-4 md:mb-0">
            <Link
              href="/contact"
              className="text-slate-400 hover:text-white transition-colors py-1 px-2"
            >
              Contact
            </Link>
            <Link
              href="/documents"
              className="text-slate-400 hover:text-white transition-colors py-1 px-2"
            >
              Documents
            </Link>
            <Link
              href="/about"
              className="text-slate-400 hover:text-white transition-colors py-1 px-2"
            >
              About
            </Link>
            <Link
              href="/projects"
              className="text-slate-400 hover:text-white transition-colors py-1 px-2"
            >
              Projects
            </Link>
            <Link
              href="/skills"
              className="text-slate-400 hover:text-white transition-colors py-1 px-2"
            >
              Skills
            </Link>
            <Link
              href="/gallery"
              className="text-slate-400 hover:text-white transition-colors py-1 px-2"
            >
              Gallery
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-slate-500 text-sm mt-4 md:mt-0"
          >
            © {new Date().getFullYear()} Isaac Maina. All rights reserved.
          </motion.div>
        </div>

        {/* Divider line */}
        <div className="border-t border-slate-700 my-6"></div>

        {/* Social links */}
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-semibold text-slate-300 mb-4">Connect With Me</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                target={link.name === 'Email' || link.name === 'Phone' ? "" : "_blank"}
                rel="noopener noreferrer"
                className="flex flex-col items-center group"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-3 rounded-full bg-slate-800 group-hover:bg-accent-cyan/20 transition-colors duration-300 mb-2">
                  <span className="text-slate-400 group-hover:text-accent-cyan transition-colors duration-300">
                    {link.icon}
                  </span>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors duration-300">
                  {link.name}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;