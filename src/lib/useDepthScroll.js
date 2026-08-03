import { useEffect, useRef } from 'react';
import { MOTION, prefersReducedMotion, onReducedMotionChange } from './motion';

/**
 * Depth on scroll.
 *
 * Registered layers sit at full scale when their centre lines up with the
 * viewport centre, and recede — smaller and dimmer — as they travel away in
 * either direction. Native scrolling is untouched; this only reads position.
 *
 * Two deliberate choices:
 *
 * 1. Styles are written straight to the DOM rather than through React state.
 *    Re-rendering every section on every scroll frame would cost far more than
 *    the effect is worth, so this stays off the render path entirely.
 *
 * 2. One rAF is scheduled per scroll event, not a permanent loop. Lenis already
 *    runs a continuous loop; a second one would burn a core while the page sits
 *    still. This idles at zero.
 *
 * Apply the ref to a wrapper *inside* a section, never to the section itself:
 * scaling a section shrinks its painted background while its layout height
 * stays, which opens a seam at every colour boundary.
 */

const layers = new Set();
let frame = null;
let listening = false;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * The curve, as a pure function so it can be tested without a DOM.
 *
 * `top`/`height` are the layer's viewport-relative box. Normalising by the
 * distance-to-fully-offscreen — rather than by viewport height — means a section
 * taller than the screen recedes gently instead of never reaching full scale.
 */
export const depthAt = (top, height, viewportHeight) => {
  const { minScale, minOpacity, range } = MOTION.depth;
  if (height === 0) return { scale: 1, opacity: 1 };

  const centre = top + height / 2;
  const travel = ((viewportHeight + height) / 2) * range;
  const t = clamp(Math.abs(centre - viewportHeight / 2) / travel, 0, 1);

  return {
    scale: 1 - (1 - minScale) * t,
    opacity: 1 - (1 - minOpacity) * t,
  };
};

const paint = () => {
  frame = null;
  const vh = window.innerHeight;

  for (const node of layers) {
    const rect = node.getBoundingClientRect();
    if (rect.height === 0) continue;

    const { scale, opacity } = depthAt(rect.top, rect.height, vh);
    node.style.transform = `scale(${scale.toFixed(4)})`;
    node.style.opacity = opacity.toFixed(3);
  }
};

const schedule = () => {
  if (frame === null) frame = requestAnimationFrame(paint);
};

const reset = () => {
  for (const node of layers) {
    node.style.transform = '';
    node.style.opacity = '';
  }
};

const startListening = () => {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  schedule();
};

const stopListening = () => {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  if (frame !== null) {
    cancelAnimationFrame(frame);
    frame = null;
  }
};

/** Returns a ref to spread onto the wrapper that should recede. */
export const useDepthLayer = () => {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    let active = false;

    const enable = () => {
      if (active) return;
      active = true;
      layers.add(node);
      startListening();
    };

    const disable = () => {
      if (!active) return;
      active = false;
      layers.delete(node);
      node.style.transform = '';
      node.style.opacity = '';
      if (layers.size === 0) stopListening();
    };

    if (!prefersReducedMotion()) enable();

    // Respond live if the visitor changes the setting mid-session.
    const unsubscribe = onReducedMotionChange((reduced) => {
      if (reduced) {
        disable();
        reset();
      } else {
        enable();
      }
    });

    return () => {
      unsubscribe();
      disable();
    };
  }, []);

  return ref;
};
