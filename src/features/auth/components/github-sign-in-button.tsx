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
      className={cn(buttonVariants({ variant: "default" }), className)}
    >
      {children ?? "Connexion GitHub"}
    </a>
  );
}
