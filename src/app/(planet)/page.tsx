import type { Metadata } from "next";
import { ViewedGithubLoginSync } from "@/features/developer-profile/components/viewed-github-login-sync";

const TITLE = "The dev world - Claim your developer territory";
const DESCRIPTION =
  "A living planet shaped by code. Every GitHub commit, PR and review claims new ground. Explore the map and see where you rank.";

const OG_IMAGE = { url: "/og/home", width: 1200, height: 630, alt: "The dev world" };

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: ["developer", "github", "planet", "territory", "ranking", "open source", "contributions", "leaderboard"],
  openGraph: {
    type: "website",
    siteName: "The dev world",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og/home"],
  },
};

export default function HomePage() {
  return <ViewedGithubLoginSync githubLogin={null} />;
}
