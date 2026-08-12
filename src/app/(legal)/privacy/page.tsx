import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & data",
  description:
    "How thedev.world handles your GitHub data, what we store, and your rights.",
};

export default function PrivacyPage() {
  return (
    <article className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Privacy & data</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: August 2026
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">What we collect</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you sign in with GitHub or when another user visits your profile,
          we fetch the following data from the public GitHub API:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>GitHub username and numeric user ID</li>
          <li>All-time commit, pull request, and code review counts</li>
          <li>Total stars and forks received across public repositories</li>
          <li>Follower count</li>
          <li>GitHub account creation date</li>
          <li>Public avatar URL</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We do not access private repositories, source code, emails, or any
          other private information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">GitHub OAuth token</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you sign in, GitHub issues an OAuth access token. This token is
          used solely to fetch your contribution data with API rate limits.
          It is stored in our database <strong className="text-foreground">encrypted at rest</strong> using
          Fernet symmetric encryption (AES-128-CBC). It is never shared with
          third parties and never used to write or modify anything on your GitHub
          account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Where data is stored</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          All data is stored in the European Union on{" "}
          <a
            href="https://www.scaleway.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            Scaleway
          </a>{" "}
          infrastructure, Paris region (<code className="text-xs bg-white/5 px-1 rounded">fr-par</code>):
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>User scores and metrics - PostgreSQL database</li>
          <li>
            Planet snapshot (aggregated public scores) - S3 Object Storage,
            publicly readable
          </li>
          <li>Profile captures - S3 Object Storage</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The planet snapshot is a JSON file containing all registered users&apos;
          public scores. It is intentionally public, this is the data that
          renders the planet map.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Data retention</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your data is kept as long as your account exists. You can request
          deletion at any time (see below). Score data is refreshed at most
          every 6 hours.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Your rights (GDPR)</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You have the right to access, correct, or delete your personal data.
          To exercise these rights, contact us at{" "}
          <a
            href="mailto:contactmaximepetit@gmail.com"
            className="text-foreground underline underline-offset-2"
          >
            contactmaximepetit@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Open source</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This project is open source. You can inspect exactly what data we
          collect and how we process it at{" "}
          <a
            href="https://github.com/thedev-world"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            github.com/thedev-world
          </a>
          .
        </p>
      </section>
    </article>
  );
}
