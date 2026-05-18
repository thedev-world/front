import type { Metadata } from "next";
import { ProfileDashboard } from "@/features/profile/components/profile-dashboard";

export const metadata: Metadata = {
  title: "Dossier · Devplanet",
  description: "Your operator dossier and combat log on Devplanet.",
};

export default function ProfilePage() {
  return <ProfileDashboard />;
}
