export function shareOnX(message: string): void {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
