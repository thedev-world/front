"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  section: string;
  githubLogin: string;
  trailing?: ReactNode;
};

export function PageStatusBar({ section, githubLogin, trailing }: Props) {
  return (
    <header className="anim-reveal-in flex flex-wrap items-center gap-x-5 gap-y-2 py-5 text-xs">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          render={<Link href="/" />}
          nativeButton={false}
        >
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to planet
        </Button>

        <span className="ticker uppercase tracking-[0.22em]">
          <span className="text-muted-foreground">{section}</span>
          <span className="mx-1 text-muted-foreground/40">/</span>
          <span className="text-foreground/80">@{githubLogin}</span>
        </span>
      </div>

      {trailing ? (
        <div className="ml-auto flex items-center gap-2">{trailing}</div>
      ) : null}
    </header>
  );
}
