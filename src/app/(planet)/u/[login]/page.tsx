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
      title: `@${login}`,
      description: `Explore @${login}'s developer territory on The dev world.`,
      openGraph: { siteName: "The dev world" },
    };
  }

  const islandLabel = getIslandLabel(user.island);
  const title = `@${user.github_login}`;
  const description = `${user.player_class.name} Lvl ${user.xp_progress.level} on ${islandLabel} Islands - ${user.cell_count} cells. Explore their territory on the developer planet.`;

  const ogImageUrl = `/og/${encodeURIComponent(user.github_login)}`;

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      siteName: "The dev world",
      url: `/u/${encodeURIComponent(user.github_login)}`,
      title: `${title} - The dev world`,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `@${user.github_login} on The dev world`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - The dev world`,
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
