import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { MOTION, prefersReducedMotion } from './motion';

/**
 * Smooth scroll with weighted pacing — a slightly heavy, damped feel that
 * suits large vehicle imagery. Skipped entirely under reduced-motion, where
 * the browser's native scrolling is the correct behaviour.
 *
 * Exposes the instance on window.__lenis so overlays can lock the page and
 * navigation can jump to top without fighting the animation loop.
 */
export const useLenis = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const lenis = new Lenis({
      lerp: MOTION.lenis.lerp,
      wheelMultiplier: MOTION.lenis.wheelMultiplier,
      touchMultiplier: MOTION.lenis.touchMultiplier,
      smoothWheel: true,
      // Native touch scrolling on phones feels better than a JS-driven one.
      syncTouch: false,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
      delete window.__lenis;
    };
  }, []);

  return lenisRef;
};

/**
 * Lock/unlock page scroll for drawers and modals.
 *
 * Reference counted: if the cart drawer and a modal are open at once, closing
 * one must not restore scrolling underneath the other.
 */
let lockCount = 0;

export const setScrollLocked = (locked) => {
  lockCount = Math.max(0, lockCount + (locked ? 1 : -1));
  const shouldLock = lockCount > 0;

  const lenis = typeof window !== 'undefined' ? window.__lenis : null;
  if (lenis) {
    if (shouldLock) lenis.stop();
    else lenis.start();
  }
  if (typeof document !== 'undefined') {
    document.body.style.overflow = shouldLock ? 'hidden' : '';
  }
};
