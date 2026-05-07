"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postLogout } from "@/features/auth/api/post-logout";
import { meQueryKey } from "@/features/auth/api/use-me";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      queryClient.setQueryData(meQueryKey, null);
    },
  });
}
