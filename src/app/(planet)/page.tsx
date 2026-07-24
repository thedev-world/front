import type { Metadata } from "next";
import { ViewedGithubLoginSync } from "@/features/developer-profile/components/viewed-github-login-sync";

const TITLE = "The dev world - Claim your developer territory";
const DESCRIPTION =
  "A living planet shaped by code. Every GitHub commit, PR and review claims new ground. Explore the map and see where you rank.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "The dev world",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function HomePage() {
  return <ViewedGithubLoginSync githubLogin={null} />;
}
