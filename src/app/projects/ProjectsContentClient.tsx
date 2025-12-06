// src/app/projects/ProjectsContentClient.tsx
"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import SupabaseImage from "@/components/SupabaseImage";
import { useState } from "react";
import ScrollAnimatedElement from "@/components/ScrollAnimatedElement";

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

interface ProjectsContentClientProps {
  projects: ProjectItem[];
}

export default function ProjectsContentClient({
  projects,
}: ProjectsContentClientProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          {" "}
          {/* Container with margin for consistent spacing */}
          <ScrollAnimatedElement
            className="text-4xl font-bold text-center"
            variant="zoomIn"
          >
            My <span className="text-accent-cyan">Projects</span>
          </ScrollAnimatedElement>
        </div>

        {projects.length === 0 ? (
          <div className="mt-16 text-center py-12">
            <p className="text-xl text-slate-500">
              No projects available at the moment.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ScrollAnimatedElement
                key={project.id}
                variant="slideUp"
                delay={index * 0.1}
                className="bg-slate-800 rounded-2xl hover:shadow-xl transition-all duration-300 border border-slate-700"
              >
                <motion.div
                  className="p-6"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-accent-cyan">
                        {project.title}
                      </h3>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300 mt-1">
                        {project.category}
                      </span>
                    </div>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center text-sm bg-accent-cyan text-slate-900 px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors whitespace-nowrap overflow-hidden truncate min-w-[100px]"
                      >
                        Visit Site
                      </a>
                    )}
                  </div>

                  <p className="text-slate-300 mb-4">{project.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {project.stack.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2 py-1 bg-accent-cyan/20 text-accent-cyan text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </ScrollAnimatedElement>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
