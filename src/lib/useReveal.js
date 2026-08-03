import { useEffect, useRef, useState } from 'react';
import { MOTION, prefersReducedMotion } from './motion';

/**
 * Effect 6 (part) — scroll pacing.
 *
 * Elements settle into place as they enter the viewport. Reveals fire once
 * and then disconnect: re-animating on every scroll-past is the thing that
 * makes a site feel restless rather than composed.
 */
export const useReveal = (options = {}) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(true);
      return undefined;
    }
    const node = ref.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window)) {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return [ref, shown];
};

/** Inline style for a revealing element. `index` staggers siblings. */
export const revealStyle = (shown, index = 0) => ({
  opacity: shown ? 1 : 0,
  transform: shown ? 'none' : `translateY(${MOTION.reveal.distance}px)`,
  transition: `opacity ${MOTION.reveal.duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${
    index * MOTION.reveal.stagger
  }ms, transform ${MOTION.reveal.duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${
    index * MOTION.reveal.stagger
  }ms`,
});
