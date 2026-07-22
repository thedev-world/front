"use client";

import { useEffect, useMemo, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { MyReadmeSource } from "@/features/readme-share/api/use-my-readme";
import { OpenOnGitHubButton } from "@/features/readme-share/components/open-on-github-button";
import { ReadmeEditorPane } from "@/features/readme-share/components/readme-editor-pane";
import { ReadmePreviewPane } from "@/features/readme-share/components/readme-preview-pane";
import { useSyncedScroll } from "@/features/readme-share/hooks/use-synced-scroll";
import {
  buildReadmeContent,
  hasExistingGithubReadme,
  type ReadmeContentMode,
} from "@/features/readme-share/lib/merge-readme-with-snippet";

type Props = {
  githubLogin: string;
  rawGithubContent: string;
  source: MyReadmeSource | "fallback";
};

function sourceHint(
  source: Props["source"],
  mode: ReadmeContentMode,
  githubLogin: string,
): string {
  if (mode === "badge-only") {
    return "Badge snippet only, enable the toggle to include your GitHub README";
  }
  switch (source) {
    case "github":
      return "Your GitHub README with the Devplanet badge appended";
    case "empty":
      return `No profile README yet, create a public repo github.com/${githubLogin}/${githubLogin} with a README.md (GitHub shows it on your profile). Starter below.`;
    case "fallback":
      return "Could not load your README, starter template below";
  }
}

export function ReadmeWorkspace({
  githubLogin,
  rawGithubContent,
  source,
}: Props) {
  const showReadmeToggle = hasExistingGithubReadme(rawGithubContent);
  const [mode, setMode] = useState<ReadmeContentMode>(
    showReadmeToggle ? "badge-only" : "full",
  );
  const [editedContent, setEditedContent] = useState<string | null>(null);

  const {
    editorRef,
    previewRef,
    handleEditorScroll,
    handlePreviewScroll,
    scrollBothToBottom,
  } = useSyncedScroll();

  const generatedContent = useMemo(
    () => buildReadmeContent(rawGithubContent, githubLogin, mode),
    [rawGithubContent, githubLogin, mode],
  );

  const content = editedContent ?? generatedContent;
  const githubEditUrl = `https://github.com/${githubLogin}/${githubLogin}/edit/main/README.md`;

  const switchMode = (next: ReadmeContentMode) => {
    setMode(next);
    setEditedContent(null);
  };

  useEffect(() => {
    if (mode !== "full") return;
    requestAnimationFrame(() => {
      scrollBothToBottom();
    });
  }, [mode, generatedContent, scrollBothToBottom]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#010409]/95">
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 px-4 py-2 sm:px-6">
        <div className="flex flex-col gap-2">
          {showReadmeToggle ? (
            <label className="flex cursor-pointer items-center gap-2.5">
              <Switch
                size="sm"
                checked={mode === "full"}
                onCheckedChange={(checked) =>
                  switchMode(checked ? "full" : "badge-only")
                }
              />
              <span className="ticker text-xs tracking-[0.16em] text-zinc-400">
                Include my README
              </span>
            </label>
          ) : null}

          <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
            {sourceHint(source, mode, githubLogin)}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <OpenOnGitHubButton content={content} githubEditUrl={githubEditUrl} />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        <div
          className={cn(
            "min-h-0 border-white/10 lg:border-r",
            mode === "badge-only" ? "flex flex-col" : "hidden lg:flex lg:flex-col",
          )}
        >
          <ReadmeEditorPane
            value={content}
            onChange={setEditedContent}
            editorRef={editorRef}
            onScroll={handleEditorScroll}
          />
        </div>

        <div
          className={cn(
            "min-h-0",
            mode === "full" ? "flex flex-col" : "hidden lg:flex lg:flex-col",
          )}
        >
          <ReadmePreviewPane
            content={content}
            previewRef={previewRef}
            onScroll={handlePreviewScroll}
          />
        </div>
      </div>
    </div>
  );
}

