import type { Metadata } from "next";

import { fetchPublicDeveloperServer } from "@/features/developer/api/public-developer-server";
import { ViewedGithubLoginSync } from "@/features/developer-profile/components/viewed-github-login-sync";
import { getIslandLabel } from "@/features/onboarding/lib/island-image";

type Params = { login: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { login } = await params;
  const user = await fetchPublicDeveloperServer(login);

  if (!user) {
    return {
      title: `@${login} - The dev world`,
      description: `Explore @${login}'s developer territory in The dev world.`,
    };
  }

  const islandLabel = getIslandLabel(user.island);
  const title = `@${user.github_login} — The dev world`;
  const description = `${user.github_login} is a ${user.player_class.name} on ${islandLabel} Islands with ${user.cell_count} cells claimed. On The dev world, every commit, PR and review expands your territory on the global developer planet.`;

  const ogImageUrl = `/og/${encodeURIComponent(user.github_login)}`

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      url: `/u/${encodeURIComponent(user.github_login)}`,
      title,
      description,
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `@${user.github_login}'s developer territory on The dev world`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function DeveloperProfilePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { login } = await params;
  return <ViewedGithubLoginSync githubLogin={login} />;
}
