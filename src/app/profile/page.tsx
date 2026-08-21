import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileDashboard } from "@/features/profile/components/profile-dashboard";

export const metadata: Metadata = {
  title: "Dossier",
  description: "Your operator dossier and combat log in The dev world.",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileDashboard />
    </Suspense>
  );
}
