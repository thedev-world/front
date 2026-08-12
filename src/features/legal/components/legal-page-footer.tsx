import Link from "next/link";
import { LEGAL_PAGES } from "../constants";

export function LegalPageFooter() {
  return (
    <footer className="border-t border-white/10 mt-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
        {LEGAL_PAGES.map((page) => (
          <Link
            key={page.path}
            href={page.path}
            className="hover:text-foreground transition-colors"
          >
            {page.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
