"use client";

import { HudBottomLeftDock } from "@/components/ui/hud-panel";
import { cn } from "@/lib/utils";

import { NETWORK_LINKS } from "../config/network-links";
import { NetworkIcon } from "./network-icons";

const iconClassName = cn(
  "flex size-8 items-center justify-center",
  "text-zinc-400 transition-colors duration-150",
  "hover:text-hi",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hi/40",
);

export function NetworkDock() {
  const links = NETWORK_LINKS;

  return (
    <HudBottomLeftDock innerClassName="px-6 py-3 pr-4">
      <div className="flex items-center gap-0.5">
        {links.map((link) => {
          const hasHref = link.href.length > 0;

          if (!hasHref) {
            return (
              <span
                key={link.id}
                aria-label={link.label}
                title={`${link.label} — coming soon`}
                className={cn(iconClassName, "cursor-default text-zinc-600 hover:text-zinc-600")}
              >
                <NetworkIcon id={link.id} className="size-4" />
              </span>
            );
          }

          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              title={link.label}
              className={iconClassName}
            >
              <NetworkIcon id={link.id} className="size-4" />
            </a>
          );
        })}
      </div>
    </HudBottomLeftDock>
  );
}
