/**
 * One place to tune the cinematic layer.
 *
 * Every effect reads its intensity from here, and every effect is disabled
 * when the visitor has asked for reduced motion. Keep values low — the point
 * is atmosphere you feel, not effects you notice.
 */

export const MOTION = {
  grain: { opacity: 0.045, fps: 8 },
  particles: { count: 26, speed: 0.14, maxOpacity: 0.35 },
  /* Both were tuned before the hero carried a full-bleed photograph of the
     product. They are fixed to the viewport, so they veil the car as much as
     the scrim does — and unlike the scrim they buy no legibility. Halved. */
  vignette: { strength: 0.22 },
  tint: { opacity: 0.09 },
  reveal: { distance: 18, duration: 620, stagger: 70 },
  lenis: { lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.6 },
  /**
   * Depth on scroll. A section sits at full scale when centred and recedes as it
   * moves away, in either direction.
   *
   * minOpacity floors at 0.62 rather than 0 on purpose: text has to stay readable
   * while a section is partly on screen, and fading toward zero reads as a
   * rendering fault. `range` is the fraction of the travel-to-offscreen distance
   * over which the effect saturates.
   */
  depth: { minScale: 0.94, minOpacity: 0.62, range: 0.8 },
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Subscribe to reduced-motion changes so effects turn off live. */
export const onReducedMotionChange = (cb) => {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e) => cb(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
};
