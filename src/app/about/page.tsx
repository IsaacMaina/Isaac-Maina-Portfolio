import { getAboutData } from "@/lib/db-service";
import { createClient } from "@supabase/supabase-js";
import AboutContentClient from "./AboutContentClient";

// Revalidate every 30 seconds to ensure updates appear
export const revalidate = 30;

export default async function AboutPage() {
  // Get basic about data from the database (excluding certifications)
  const aboutData = await getAboutData();

  // Create updated about data without certifications
  const updatedAboutData = {
    profile: aboutData.profile,
    education: aboutData.education,
    experiences: aboutData.experiences,
  };

  return (
    <AboutContentClient aboutData={updatedAboutData} />
  );
}