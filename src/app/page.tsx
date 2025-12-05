// app/page.tsx
import HomeContent from "@/app/components/HomeContent";
import { getUserProfile } from "@/lib/db-service";
import LoadingSpinner from "@/components/LoadingSpinner";

export default async function HomePage() {
  const profile = await getUserProfile();

  // If we wanted to add skeleton loading, we could add a delay to simulate data fetching
  // But for server components, actual suspense/skeleton loading needs to be handled differently
  
  return (
    <HomeContent profile={profile} />
  );
}