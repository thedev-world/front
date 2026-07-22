import {
  buildDefaultReadmeContent,
  buildReadmeSnippet,
} from "@/features/readme-share/lib/build-readme-snippet";

const SNIPPET_RE = /thedev\.world\/og\//;

export type ReadmeContentMode = "badge-only" | "full";

export function mergeReadmeWithSnippet(content: string, login: string): string {
  const snippet = buildReadmeSnippet(login);
  if (SNIPPET_RE.test(content)) return content;
  const base = content.trimEnd();
  return base ? `${base}\n\n${snippet}\n` : buildDefaultReadmeContent(login);
}

export function buildReadmeContent(
  rawGithubContent: string,
  login: string,
  mode: ReadmeContentMode,
): string {
  if (mode === "badge-only") {
    return `${buildReadmeSnippet(login)}\n`;
  }
  return mergeReadmeWithSnippet(rawGithubContent, login);
}

export function hasExistingGithubReadme(rawGithubContent: string): boolean {
  return rawGithubContent.trim().length > 0;
}
