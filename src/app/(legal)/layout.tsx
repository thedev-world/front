import type { ReactNode } from "react";

import { DashboardPageHeader } from "@/components/ui/dashboard-page-header";
import { DashboardPageShell } from "@/components/ui/dashboard-page-shell";
import { PageScroll } from "@/components/ui/page-scroll";
import { LegalPageHeader } from "@/features/legal/components/legal-page-header";
import { LegalPageFooter } from "@/features/legal/components/legal-page-footer";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardPageShell>
      <DashboardPageHeader>
        <div className="mx-auto w-full max-w-3xl">
          <LegalPageHeader />
        </div>
      </DashboardPageHeader>

      <PageScroll>
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          {children}
        </div>
        <LegalPageFooter />
      </PageScroll>
    </DashboardPageShell>
  );
}
