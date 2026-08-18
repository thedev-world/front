"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HudDialog } from "@/components/ui/hud-dialog";
import { useDeleteAccount } from "@/features/auth/api/use-delete-account";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAccountDialog({ open, onOpenChange }: Props) {
  const deleteMutation = useDeleteAccount();

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <HudDialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Delete account"
      ariaLabel="Delete account confirmation"
      closeLabel="Close delete account dialog"
      icon={<Trash2 size={12} className="shrink-0 text-red-400/80" />}
    >
      <div className="flex flex-col gap-5 p-6">
        <p className="text-sm leading-relaxed text-zinc-300">
          This will permanently delete your account, remove your territory from
          the planet, and erase all your stats and progress. This action cannot
          be undone.
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            fullWidth
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            <Trash2 size={12} className="shrink-0" />
            Delete account
          </Button>
        </div>
      </div>
    </HudDialog>
  );
}
