"use client";

import { useCallback, useRef } from "react";

function syncScrollPosition(source: HTMLElement, target: HTMLElement) {
  const sourceMax = source.scrollHeight - source.clientHeight;
  const targetMax = target.scrollHeight - target.clientHeight;
  if (sourceMax <= 0 || targetMax <= 0) return;
  const ratio = source.scrollTop / sourceMax;
  target.scrollTop = ratio * targetMax;
}

export function useSyncedScroll() {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);

  const scrollBothToBottom = useCallback(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    syncingRef.current = true;
    editor.scrollTop = editor.scrollHeight;
    preview.scrollTop = preview.scrollHeight;
    syncingRef.current = false;
  }, []);

  const handleEditorScroll = useCallback(() => {
    if (syncingRef.current) return;
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    syncingRef.current = true;
    syncScrollPosition(editor, preview);
    syncingRef.current = false;
  }, []);

  const handlePreviewScroll = useCallback(() => {
    if (syncingRef.current) return;
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    syncingRef.current = true;
    syncScrollPosition(preview, editor);
    syncingRef.current = false;
  }, []);

  return {
    editorRef,
    previewRef,
    handleEditorScroll,
    handlePreviewScroll,
    scrollBothToBottom,
  };
}
