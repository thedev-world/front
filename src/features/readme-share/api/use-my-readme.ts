"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

export type MyReadmeSource = "github" | "empty";

export type MyReadme = {
  content: string;
  source: MyReadmeSource;
};

export const myReadmeQueryKey = ["me", "readme"] as const;

async function loadMyReadme(): Promise<MyReadme | null> {
  const res = await apiFetch("/api/v1/me/readme", { passThrough401: true });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text.trim() || `HTTP error ${res.status}`);
  }
  return res.json() as Promise<MyReadme>;
}

export function useMyReadme(enabled: boolean) {
  return useQuery({
    queryKey: myReadmeQueryKey,
    queryFn: loadMyReadme,
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
