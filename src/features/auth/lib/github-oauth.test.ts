import { describe, expect, it } from "vitest";
import { getGitHubOAuthStartUrl } from "@/features/auth/lib/github-oauth";

describe("github-oauth", () => {
  it("adds include_orgs when requested", () => {
    const url = getGitHubOAuthStartUrl({ includeOrgs: true });
    expect(url).toContain("include_orgs=true");
  });

  it("omits include_orgs by default", () => {
    const url = getGitHubOAuthStartUrl();
    expect(url).not.toContain("include_orgs");
  });
});
