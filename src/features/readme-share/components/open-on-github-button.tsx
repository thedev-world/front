"use client";

import { Check, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  content: string;
  githubEditUrl: string;
};

export function OpenOnGitHubButton({ content, githubEditUrl }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleOpen = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch {
      setCopied(false);
    }
    window.open(githubEditUrl, "_blank", "noopener,noreferrer");
  }, [content, githubEditUrl]);

  return (
    <Button variant="secondary" size="sm" onClick={() => void handleOpen()}>
      {copied ? (
        <Check className="size-3.5 shrink-0 text-hi" aria-hidden />
      ) : (
        <ExternalLink className="size-3.5 shrink-0" aria-hidden />
      )}
      {copied ? "Copied, paste on GitHub" : "Copy & open on GitHub"}
    </Button>
  );
}
