// src/app/about/AboutContentClient.tsx
"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";
import SupabaseImage from "@/components/SupabaseImage";
import { useState } from "react";
import ScrollAnimatedElement from "@/components/ScrollAnimatedElement";

interface AboutContentProps {
  aboutData: {
    profile: {
      name: string;
      title: string;
      about: string;
      location: string;
      phone: string;
      careerFocus: string;
      image: string;
      email?: string; // Added email field
    };
    education: Array<{
      id: number;
      school: string;
      degree: string;
      period: string;
      description: string;
    }>;
    experiences: Array<{
      id: number;
      title: string;
      company: string;
      period: string;
      description: string;
    }>;
    certifications: Array<{
      id: number;
      title: string;
      description: string;
      file?: string; // Added file property for the certificate URL
    }>;
  };
}

export default function AboutContentClient({ aboutData }: AboutContentProps) {
  const { profile, education, experiences, certifications } = aboutData;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get email from session or use a default value
  // For now, we'll need to get it from somewhere else - maybe from global config or just leave as placeholder
  const email = "mainaisaacwachira2000@gmail.com"; // This should come from your profile data when available

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimatedElement
          className="text-4xl font-bold mb-12 text-center"
          variant="zoomIn"
        >
          About <span className="text-accent-cyan">Me</span>
        </ScrollAnimatedElement>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile Info Card */}
          <ScrollAnimatedElement
            className="lg:col-span-1"
            variant="slideRight"
            delay={0.1}
          >
            <motion.div
              className="card"
              whileHover={isModalOpen ? undefined : { y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-40 h-40 rounded-full bg-slate-700 border-4 border-accent-cyan mb-6 overflow-hidden"
                  whileHover={isModalOpen ? undefined : { scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  {profile.image ? (
                    <SupabaseImage
                      filePath={profile.image}
                      alt={profile.name || "Profile image"}
                      className="w-full h-full object-cover"
                      onModalChange={setIsModalOpen}
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">{profile.name || "Isaac Maina"}</h2>
                <p className="text-accent-cyan mb-4">{profile.title}</p>

                <div className="space-y-2 w-full mt-4 text-left">
                  <p><span className="text-accent-cyan">Email:</span> {profile.email || email}</p>
                  <p><span className="text-accent-cyan">Location:</span> {profile.location}</p>
                  <p><span className="text-accent-cyan">Phone:</span> {profile.phone}</p>
                  <p><span className="text-accent-cyan">Focus:</span> {profile.careerFocus}</p>
                </div>
              </div>
            </motion.div>
          </ScrollAnimatedElement>

          {/* Biography and Experience */}
          <ScrollAnimatedElement
            className="lg:col-span-2 space-y-12"
            variant="slideLeft"
            delay={0.1}
          >
            {/* Biography */}
            <ScrollAnimatedElement variant="slideUp" delay={0.2}>
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-slate-700">Biography</h2>
              <p className="text-slate-300 leading-relaxed">
                {profile.about}
              </p>
            </ScrollAnimatedElement>

            {/* Education */}
            <ScrollAnimatedElement variant="slideUp" delay={0.3}>
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-slate-700">Education</h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <ScrollAnimatedElement
                    key={edu.id}
                    variant="slideUp"
                    delay={0.4 + index * 0.05}
                    as="div"
                  >
                    <motion.div
                      className="border-l-4 border-accent-cyan pl-4 py-1 hover:border-accent-cyan/80 transition-colors duration-300"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-xl font-semibold">{edu.degree}</h3>
                      <p className="text-slate-400">{edu.school} - {edu.period}</p>
                      <p className="mt-2 text-slate-300">{edu.description}</p>
                    </motion.div>
                  </ScrollAnimatedElement>
                ))}
              </div>
            </ScrollAnimatedElement>

            {/* Experience Timeline */}
            <ScrollAnimatedElement variant="slideUp" delay={0.4}>
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-slate-700">Experience</h2>
              <div className="relative space-y-8">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 h-full w-0.5 bg-slate-700 transform -translate-x-1/2"></div>

                {experiences.map((exp, index) => (
                  <ScrollAnimatedElement
                    key={exp.id}
                    variant="slideUp"
                    delay={0.5 + index * 0.05}
                    as="div"
                  >
                    <motion.div
                      className="relative pl-12"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-accent-cyan flex items-center justify-center transform -translate-x-1/2">
                        <div className="w-3 h-3 rounded-full bg-slate-900"></div>
                      </div>
                      <h3 className="text-xl font-semibold">{exp.title}</h3>
                      <p className="text-slate-400">{exp.company} - {exp.period}</p>
                      <p className="mt-2 text-slate-300">
                        {exp.description}
                      </p>
                    </motion.div>
                  </ScrollAnimatedElement>
                ))}
              </div>
            </ScrollAnimatedElement>

            {/* Certifications */}
            <ScrollAnimatedElement variant="slideUp" delay={0.5}>
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-slate-700">Certifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <ScrollAnimatedElement
                    key={cert.id}
                    variant="slideUp"
                    delay={0.6 + index * 0.05}
                    as="div"
                  >
                    <motion.div
                      className="p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors duration-300 hover:shadow-lg"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{cert.title}</h3>
                          <p className="text-slate-400 text-sm">{cert.description}</p>
                        </div>
                        {cert.file && (
                          <div className="flex space-x-2 ml-2">
                            <a
                              href={cert.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-cyan hover:text-cyan-400 flex items-center text-sm"
                              title="View certificate"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </a>
                            <a
                              href={cert.file}
                              download={cert.title}
                              className="text-slate-300 hover:text-white flex items-center text-sm ml-2"
                              title="Download certificate"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </ScrollAnimatedElement>
                ))}
              </div>
            </ScrollAnimatedElement>
          </ScrollAnimatedElement>
        </div>
      </div>
    </div>
  );
}