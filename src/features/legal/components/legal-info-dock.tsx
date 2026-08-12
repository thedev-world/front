"use client";

import { Info } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { LEGAL_PAGES } from "../constants";

const triggerClassName = cn(
  "flex size-8 items-center justify-center",
  "text-zinc-400 transition-colors duration-150",
  "hover:text-hi",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hi/40",
);

export function LegalInfoDock() {
  return (
    <div className="absolute bottom-4 right-4 z-40 max-hud-compact:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Legal information" className={triggerClassName}>
          <Info className="size-4 cursor-pointer" />
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="end" sideOffset={8} className="min-w-[11rem]">
          {LEGAL_PAGES.map((page) => (
            <DropdownMenuItem
              key={page.path}
              render={
                <Link href={page.path}>
                  {page.label}
                </Link>
              }
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
