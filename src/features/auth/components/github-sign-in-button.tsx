import { buttonVariants } from "@/components/ui/button";
import { githubOAuthStartUrl } from "@/features/auth/lib/github-oauth-start-url";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function GitHubSignInButton({ className, children }: Props) {
  return (
    <a
      href={githubOAuthStartUrl()}
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
