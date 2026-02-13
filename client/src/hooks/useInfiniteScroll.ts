import { useEffect, useRef } from 'react';

/**
 * Fires `onIntersect` when the ref element enters the viewport.
 * Use this to trigger the next page load in infinite scrolling.
 */
export function useInfiniteScroll(
  onIntersect: () => void,
  options: { enabled?: boolean; threshold?: number } = {},
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { enabled = true, threshold = 0.1 } = options;

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      { threshold },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onIntersect, enabled, threshold]);

  return ref;
}
