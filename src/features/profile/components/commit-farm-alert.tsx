import { TriangleAlert } from "lucide-react"
import { Alert, AlertContent, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Props = {
  /** compact = inline card (overlay panel), full = page banner */
  size?: "compact" | "full"
}

export function CommitFarmAlert({ size = "full" }: Props) {
  return (
    <Alert variant="warning">
      <TriangleAlert size={14} />
      <AlertContent>
        <AlertTitle>Unusual commit activity detected</AlertTitle>
        <AlertDescription>
          This profile&apos;s commit count significantly exceeds the number of
          traceable contributions across visible repositories. XP has been
          adjusted to reflect verified activity only.
          {size === "full" && (
            <>
              {" "}
              If you believe this flag is incorrect,{" "}
              <a
                href="mailto:contactmaximepetit@gmail.com"
                className="underline underline-offset-2 hover:opacity-100 opacity-90"
              >
                contact the administrator
              </a>
              .
            </>
          )}
        </AlertDescription>
      </AlertContent>
    </Alert>
  )
}
