"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/api/use-logout";

type Props = {
  className?: string;
};

export function LogoutButton({ className }: Props) {
  const logoutMutation = useLogout();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={logoutMutation.isPending}
      onClick={() => void logoutMutation.mutate()}
      className={className}
    >
      Logout
    </Button>
  );
}
