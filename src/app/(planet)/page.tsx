import type { Metadata } from "next";
import { ViewedGithubLoginSync } from "@/features/developer-profile/components/viewed-github-login-sync";

export const metadata: Metadata = {
  title: "The dev world — Claim your developer territory",
  description:
    "A living planet shaped by code. Every GitHub commit, pull request and review claims new ground. Explore the global developer map and see where you rank.",
  openGraph: {
    type: "website",
    title: "The dev world — Claim your developer territory",
    description:
      "A living planet shaped by code. Every GitHub commit, pull request and review claims new ground. Explore the global developer map and see where you rank.",
  },
};

export default function HomePage() {
  return <ViewedGithubLoginSync githubLogin={null} />;
}
