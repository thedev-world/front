import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How thedev.world turns your GitHub activity into XP, levels, and territory.",
};

// Reference values computed from scoring.py for the examples table
const XP_WEIGHTS = [
  { signal: "Commit", weight: "×10 XP", note: "All-time, across all repos" },
  { signal: "Pull Request", weight: "×30 XP", note: "Contributions, not just authored" },
  { signal: "Code Review", weight: "×15 XP", note: "PR reviews submitted" },
  { signal: "Star received", weight: "×50 XP", note: "Capped, see below" },
  { signal: "Fork received", weight: "×40 XP", note: "On owned repositories" },
  { signal: "Follower", weight: "×20 XP", note: "Capped at 500 followers" },
  { signal: "Year on GitHub", weight: "×200 XP", note: "Full calendar years" },
];

const PLAYER_CLASSES = [
  { name: "Seedling", level: 1, phrase: "It compiles. That's something." },
  { name: "Builder", level: 5, phrase: "You build, it breaks, you rebuild." },
  { name: "Crafter", level: 10, phrase: "People read your code without crying." },
  { name: "Architect", level: 20, phrase: "You open issues on repos you didn't write." },
  { name: "Maintainer", level: 35, phrase: "You merge PRs on Sundays. On purpose." },
  { name: "Legend", level: 55, phrase: "People learned to code on your code." },
  { name: "Sovereign", level: 80, phrase: "You deprecate APIs. People adapt." },
  { name: "Founder", level: 100, phrase: "Someone forked your thing. Good. That was the point." },
];

export default function HowItWorksPage() {
  return (
    <article className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">How It Works</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-prose">
          thedev.world turns your public GitHub activity into XP, a level, and a
          territory on a shared developer planet. Here&apos;s exactly how every
          number is calculated.
        </p>
      </div>

      {/* XP Formula */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">XP formula</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your total XP is the weighted sum of your GitHub signals:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-6 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Signal
                </th>
                <th className="text-left py-2 pr-6 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Weight
                </th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {XP_WEIGHTS.map((row) => (
                <tr key={row.signal} className="border-b border-white/5">
                  <td className="py-2 pr-6 font-medium">{row.signal}</td>
                  <td className="py-2 pr-6 font-mono text-xs">{row.weight}</td>
                  <td className="py-2 text-muted-foreground">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Caps */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Anti-whale caps</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Two caps prevent a single outsized metric from dominating the score:
        </p>
        <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
          <li>
            <strong className="text-foreground">Followers</strong> - capped at{" "}
            <strong className="text-foreground">500</strong>. Beyond that,
            followers no longer contribute XP.
          </li>
          <li>
            <strong className="text-foreground">Stars per repository</strong> -
            if your total star count exceeds{" "}
            <strong className="text-foreground">50</strong>, no single repository
            can contribute more than{" "}
            <strong className="text-foreground">30%</strong> of that total.
            Example: 1 000 total stars: any repo is capped at 300 stars for XP
            purposes.
          </li>
        </ul>
      </section>

      {/* Level system */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Level system</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Levels use a power curve, each level requires progressively more XP:
        </p>
        <pre className="text-xs bg-white/5 rounded px-4 py-3 overflow-x-auto text-muted-foreground">
          {`XP to reach level n = round(100 × n^1.8)

Level  2  ->       348 XP
Level  5  ->     1 741 XP
Level 10  ->     6 310 XP
Level 20  ->    22 867 XP
Level 35  ->    62 459 XP
Level 55  ->   229 086 XP
Level 80  ->   562 341 XP
Level 100 ->   398 107 XP`}
        </pre>
        <p className="text-sm text-muted-foreground">
          The maximum level is <strong className="text-foreground">200</strong>.
        </p>
      </section>

      {/* Player classes */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Player classes</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your class upgrades automatically as you level up, 8 tiers in total:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-6 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Class
                </th>
                <th className="text-left py-2 pr-6 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Min level
                </th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  phrase
                </th>
              </tr>
            </thead>
            <tbody>
              {PLAYER_CLASSES.map((c) => (
                <tr key={c.name} className="border-b border-white/5">
                  <td className="py-2 pr-6 font-medium">{c.name}</td>
                  <td className="py-2 pr-6 font-mono text-xs">{c.level}</td>
                  <td className="py-2 text-muted-foreground italic text-xs">
                    &ldquo;{c.phrase}&rdquo;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Territory / cells */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Planet cells (territory)</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your territory on the planet is measured in cells. The cell count grows
          sub-linearly with XP, to keep the map readable as
          top users accumulate large scores:
        </p>
        <pre className="text-xs bg-white/5 rounded px-4 py-3 overflow-x-auto text-muted-foreground">
          {`Levels 1–50:   cells = 1 + round((XP / 100)^0.62)
Levels 51+:    cells = base + round((level - 50)^1.2 × 2)
               where base ≈ cells at level 50

Examples:
   1 000 XP  -> ~5 cells
  10 000 XP  -> ~25 cells
 100 000 XP  -> ~115 cells
 500 000 XP  -> ~363 cells`}
        </pre>
        <p className="text-sm text-muted-foreground">
          Beyond level 50, cell growth follows the level progression rather than
          raw XP, giving a bonus to very active developers (the &ldquo;whale bonus&rdquo;).
        </p>
      </section>

      {/* Sync */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">Score sync</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your score refreshes automatically when you visit your profile, if at
          least <strong className="text-foreground">6 hours</strong> have elapsed
          since the last sync. On the first sync, all historical data is fetched.
          On subsequent syncs, only the delta since the last sync is added.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Source of truth</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The full scoring logic is open source and can be audited at{" "}
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
