"use client";

import { usePathname } from "next/navigation";
import { PageStatusBar } from "@/components/ui/page-status-bar";
import { LEGAL_PAGES } from "../constants";

export function LegalPageHeader() {
  const pathname = usePathname();
  const current = LEGAL_PAGES.find((p) => p.path === pathname);
  const section = current?.label ?? "Legal";

  return <PageStatusBar section={section} />;
}
