import { getUserProfile } from "@/lib/db-service";
import ContactContentClient from "./ContactContentClient";

// Revalidate every 30 seconds to ensure updates appear
export const revalidate = 30;

export default async function ContactPage() {
  const profile = await getUserProfile();

  return (
    <ContactContentClient profile={profile} />
  );
}