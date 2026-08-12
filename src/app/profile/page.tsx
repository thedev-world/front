import type { Metadata } from "next";
import { ProfileDashboard } from "@/features/profile/components/profile-dashboard";

export const metadata: Metadata = {
  title: "Dossier",
  description: "Your operator dossier and combat log in The dev world.",
};

export default function ProfilePage() {
  return <ProfileDashboard />;
}
