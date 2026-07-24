import { env } from "@/config/env";

export const README_SNIPPET_HEADING = "## My thedev.world live stats";

export function buildReadmeSnippet(login: string): string {
  return `${README_SNIPPET_HEADING}

[![My The Dev World stats](${env.siteUrl}/og/${login})](${env.siteUrl}/u/${login})`;
}

export function buildDefaultReadmeContent(login: string): string {
  return `# Hi, I'm @${login}

${buildReadmeSnippet(login)}

Building on [thedev.world](${env.siteUrl}).`;
}
