import { env } from "@/config/env";
import type { MeProfile } from "@/features/auth/types/me";
import { getIslandLabel } from "@/features/onboarding/lib/island-image";

export function getProfileShareUrl(login: string): string {
  return `${env.siteUrl}/u/${encodeURIComponent(login)}`;
}

export function getProfileOgImageUrl(login: string): string {
  return `${env.siteUrl}/og/${encodeURIComponent(login)}`;
}

export function buildProfileShareTweetBody(): string {
  return [
    "Your commits deserve a map. I claimed mine on thedev.world."
  ].join("\n");
}

/** Full payload sent to the X intent. */
export function buildProfileShareMessage(profile: MeProfile): string {
  return [
    buildProfileShareTweetBody(),
    getProfileShareUrl(profile.github_login),
  ].join("\n");
}

export function getProfileShareLinkPreview(profile: MeProfile) {
  const islandLabel = getIslandLabel(profile.island);
  const description = islandLabel
    ? `${profile.cell_count} cells on ${islandLabel} Island`
    : `${profile.cell_count} cells claimed`;

  return {
    url: getProfileShareUrl(profile.github_login),
    domain: "thedev.world",
    title: `@${profile.github_login} on The dev world`,
    description,
    imageUrl: getProfileOgImageUrl(profile.github_login),
  };
}
