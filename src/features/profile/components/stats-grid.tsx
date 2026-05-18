"use client";

import {
  GitCommit,
  GitPullRequest,
  GitFork,
  MessageSquare,
  Star,
  Users,
  Box,
} from "lucide-react";
import type { MeProfile } from "@/features/auth/types/me";
import { StatTile } from "@/features/profile/components/stat-tile";
import { SectionTickerHeading } from "@/components/ui/section-ticker-heading";

type Props = {
  profile: MeProfile;
};

export function StatsGrid({ profile }: Props) {
  return (
    <section
      className="anim-reveal-up"
      style={{ animationDelay: "180ms" }}
      aria-labelledby="stats-heading"
    >
      <header className="mb-6 flex items-baseline justify-between pb-5">
        <SectionTickerHeading
          id="stats-heading"
          title="stats"
        />
      </header>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
        <StatTile
          label="Commits"
          value={profile.commits_alltime}
          icon={<GitCommit />}
        />
        <StatTile
          label="Pull requests"
          value={profile.prs_contributions_alltime}
          icon={<GitPullRequest />}
          delay={60}
        />
        <StatTile
          label="Reviews"
          value={profile.reviews_alltime}
          icon={<MessageSquare />}
          delay={120}
        />
        <StatTile
          label="Stars"
          value={profile.stars_received_capped}
          icon={<Star />}
          delay={180}
        />
        <StatTile
          label="Followers"
          value={profile.followers}
          icon={<Users />}
          delay={240}
        />
        <StatTile
          label="Forks"
          value={profile.forks_received}
          icon={<GitFork />}
          delay={300}
        />
        <StatTile
          label="Repos"
          value={profile.owned_non_fork_repos_count}
          icon={<Box />}
          delay={360}
        />
      </div>
    </section>
  );
}
