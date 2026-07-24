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
  const title = `@${user.github_login} - ${user.player_class.name} (Lvl ${user.xp_progress.level})`;
  const description = islandLabel
    ? `${user.player_class.name} on ${islandLabel} Islands - level ${user.xp_progress.level}, ${user.cell_count} cells claimed.`
    : `${user.player_class.name} - level ${user.xp_progress.level}, ${user.cell_count} cells claimed.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `/og/${encodeURIComponent(user.github_login)}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/og/${encodeURIComponent(user.github_login)}`],
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
