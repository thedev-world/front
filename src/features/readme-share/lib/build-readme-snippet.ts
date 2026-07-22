const SITE_URL = "https://thedev.world";

export const README_SNIPPET_HEADING = "## My thedev.world live stats";

export function buildReadmeSnippet(login: string): string {
  return `${README_SNIPPET_HEADING}

[![My The Dev World stats](${SITE_URL}/og/${login})](${SITE_URL})`;
}

export function buildDefaultReadmeContent(login: string): string {
  return `# Hi, I'm @${login}

${buildReadmeSnippet(login)}

Building on [thedev.world](${SITE_URL}).`;
}
