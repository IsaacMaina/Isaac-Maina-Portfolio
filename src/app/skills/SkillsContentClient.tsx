// src/app/skills/SkillsContentClient.tsx
"use client";

import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

// Define the skill structure
interface Skill {
  name: string;
  level: number;
}

// Define the skill category structure
interface SkillCategory {
  title: string;
  skills: Skill[];
}

// Define the skills data structure
interface SkillsData {
  skillCategories: SkillCategory[];
  additionalSkills: string[];
}

interface SkillsContentClientProps {
  skillsData: SkillsData;
}

export default function SkillsContentClient({ skillsData }: SkillsContentClientProps) {
  const { skillCategories, additionalSkills } = skillsData;

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
          {skillCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-8 text-accent-cyan">{category.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {category.skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{skill.name}</span>
                      <span>{skill.level}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <motion.div
                        className="bg-accent-cyan h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ delay: 0.3 + (index * 0.05), duration: 1.5, ease: "easeOut" }}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Additional Skills Section */}
          {additionalSkills && additionalSkills.length > 0 && (
            <motion.div
              className="mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-8 text-center">Other Technical Skills</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {additionalSkills.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="px-5 py-3 bg-slate-800 rounded-full text-center hover:bg-accent-cyan hover:text-slate-900 transition-colors duration-300 cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }}
                  >
                    {skill}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}