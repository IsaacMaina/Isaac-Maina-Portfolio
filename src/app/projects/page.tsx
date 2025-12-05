import { getProjects } from "@/lib/db-service";
import ProjectsContentClient from "./ProjectsContentClient";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <ProjectsContentClient projects={projects} />
  );
}