"use client";

import type { RefObject } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  onScroll: () => void;
};

export function ReadmeEditorPane({
  value,
  onChange,
  editorRef,
  onScroll,
}: Props) {
  return (
    <textarea
      ref={editorRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onScroll={onScroll}
      spellCheck={false}
      aria-label="Markdown source"
      className="size-full min-h-0 resize-none overflow-auto bg-[#161b22] p-4 font-mono text-[13px] leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-600"
    />
  );
}
