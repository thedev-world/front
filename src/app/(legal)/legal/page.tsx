import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal notice",
  description: "Legal information about thedev.world.",
};

export default function LegalPage() {
  return (
    <article className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Legal Notice</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: August 2026
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Publisher</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Maxime Petit
          <br />
          Email:{" "}
          <a
            href="mailto:contactmaximepetit@gmail.com"
            className="text-foreground underline underline-offset-2"
          >
            contactmaximepetit@gmail.com
          </a>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Hosting</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Scaleway SAS
          <br />
          8 rue de la Ville l&apos;Evêque, 75008 Paris, France
          <br />
          <a
            href="https://www.scaleway.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            scaleway.com
          </a>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Open Source</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          thedev.world is an open-source project published under the MIT License.
          The source code is available on GitHub:{" "}
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

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Intellectual Property</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          All content and code on this site is either open-source (MIT License)
          or derived from publicly available GitHub data. GitHub is a trademark
          of GitHub, Inc. thedev.world is not affiliated with GitHub.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Contact</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For any inquiry, please contact{" "}
          <a
            href="mailto:contactmaximepetit@gmail.com"
            className="text-foreground underline underline-offset-2"
          >
            contactmaximepetit@gmail.com
          </a>
          .
        </p>
      </section>
    </article>
  );
}
