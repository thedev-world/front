import { describe, expect, it } from "vitest";
import {
  GITHUB_REAUTH_REQUIRED_DETAIL,
  GitHubReauthRequiredError,
} from "@/features/auth/lib/github-oauth";

describe("github-oauth", () => {
  it("uses the API reauth detail constant", () => {
    expect(GITHUB_REAUTH_REQUIRED_DETAIL).toBe("github_reauth_required");
  });

  it("names GitHubReauthRequiredError", () => {
    const err = new GitHubReauthRequiredError();
    expect(err.name).toBe("GitHubReauthRequiredError");
    expect(err.status).toBe(401);
  });
});
