import { buttonVariants } from "@/components/ui/button";
import { resolveApiUrl } from "@/lib/api-url";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function GitHubSignInButton({ className, children }: Props) {
  return (
    <a
      href={resolveApiUrl("/api/v1/auth/github/start")}
      className={cn(
        buttonVariants({ variant: "default" }),
        className,
        "border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/15 text-white",
      )}
    >
      {children ?? "Sign in with GitHub"}
    </a>
  );
}
