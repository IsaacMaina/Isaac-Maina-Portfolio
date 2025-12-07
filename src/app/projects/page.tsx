import { getProjects } from "@/lib/db-service";
import ProjectsContentClient from "./ProjectsContentClient";

// Revalidate every 30 seconds to ensure updates appear
export const revalidate = 30;

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <ProjectsContentClient projects={projects} />
  );
}