"use client";

import Markdown from "react-markdown";
import type { RefObject } from "react";

import { readmeMarkdownComponents } from "@/features/readme-share/lib/readme-markdown-components";

type Props = {
  content: string;
  previewRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
};

export function ReadmePreviewPane({ content, previewRef, onScroll }: Props) {
  return (
    <div
      ref={previewRef}
      onScroll={onScroll}
      className="markdown-body size-full min-h-0 overflow-auto bg-[#0d1117] p-6 text-[14px] leading-relaxed text-zinc-300"
    >
      <Markdown components={readmeMarkdownComponents}>{content}</Markdown>
    </div>
  );
}
