import { getUserProfile } from "@/lib/db-service";
import ContactContentClient from "./ContactContentClient";

export default async function ContactPage() {
  const profile = await getUserProfile();

  return (
    <ContactContentClient profile={profile} />
  );
}