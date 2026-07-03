/** Grain texture + top hairline. Background is handled directly on html in globals.css. */
export function CosmicBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0">
      <div className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.72 0.19 288 / 0.3), transparent)",
        }}
      />
    </div>
  );
}
