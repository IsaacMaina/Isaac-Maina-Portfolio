import { getSkillsData as getSkillsFromDB } from "@/lib/db-service";
import SkillsContentClient from "./SkillsContentClient";

// Revalidate every 30 seconds to ensure updates appear
export const revalidate = 30;

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

export default async function SkillsPage() {
  const skillsData: SkillsData = await getSkillsFromDB();

  return (
    <SkillsContentClient skillsData={skillsData} />
  );
}