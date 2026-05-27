import Image from "next/image";
import { cn } from "@/lib/utils";

type BadgeGlowProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /**
   * Intensity of the glow layer: scale factor and opacity of the blurred copy.
   * "subtle" suits small nodes in a list; "strong" suits the hero badge.
   */
  intensity?: "subtle" | "strong";
  /** Extra CSS class added to the blurred copy only. */
  glowClassName?: string;
  /** Skip glow (e.g. locked state). */
  disabled?: boolean;
};

/**
 * Renders a badge PNG with a color-accurate ambient glow.
 *
 * Technique: render the same image twice.
 * The bottom copy is aria-hidden, blurred, slightly scaled up and desaturated
 * — the browser uses the actual PNG pixel colors to compute the blur,
 * so the glow automatically matches the badge palette with no JS or CSS
 * color hardcoding.
 */
export function BadgeGlow({
  src,
  alt,
  width,
  height,
  priority,
  className,
  imageClassName,
  intensity = "subtle",
  glowClassName,
  disabled = false,
}: BadgeGlowProps) {
  return (
    <div className={cn("relative isolate", className)}>
      {/* Blurred copy — produces the color-accurate glow */}
      {!disabled && (
        <Image
          src={src}
          alt=""
          aria-hidden
          width={width}
          height={height}
          draggable={false}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full select-none object-contain",
            intensity === "subtle" && "scale-[1.15] opacity-55 blur-[14px]",
            intensity === "strong" && "scale-[1.18] opacity-40 blur-[32px]",
            glowClassName,
          )}
        />
      )}

      {/* Real image on top */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        draggable={false}
        className={cn(
          "relative z-10 h-full w-full select-none object-contain",
          imageClassName,
        )}
      />
    </div>
  );
}
