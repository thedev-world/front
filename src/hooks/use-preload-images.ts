import { useEffect, useRef } from "react";

export function usePreloadImages<T>(
  items: T[],
  getUrl: (item: T) => string | null | undefined,
  onLoaded?: (item: T) => void
) {
  const getUrlRef = useRef(getUrl);
  const onLoadedRef = useRef(onLoaded);
  const itemsRef = useRef(items);

  // Update refs in an effect to avoid mutating refs during render (Concurrent Mode safe)
  useEffect(() => {
    getUrlRef.current = getUrl;
    onLoadedRef.current = onLoaded;
    itemsRef.current = items;
  });

  const serializedUrls = items
    .map((item) => getUrl(item))
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    if (typeof window === "undefined" || !serializedUrls) return;

    let cancelled = false;
    const preloadLinks: HTMLLinkElement[] = [];

    itemsRef.current.forEach((item) => {
      const url = getUrlRef.current(item);
      if (!url) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      document.head.appendChild(link);
      preloadLinks.push(link);

      const img = new Image();
      img.decoding = "async";
      img.src = url;

      const promise = img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load ${url}`));
          });

      promise
        .then(() => img.decode())
        .then(() => {
          if (cancelled) return;
          if (onLoadedRef.current) {
            onLoadedRef.current(item);
          }
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
      preloadLinks.forEach((link) => link.remove());
    };
  }, [serializedUrls]);
}
