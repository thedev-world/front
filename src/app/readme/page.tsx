import type { Metadata } from "next";

import { ReadmeShareDashboard } from "@/features/readme-share/components/readme-share-dashboard";

export const metadata: Metadata = {
  title: "Add to README",
  description:
    "Copy a thedev.world stats badge for your GitHub README and preview it live.",
};

export default function ReadmePage() {
  return <ReadmeShareDashboard />;
}
