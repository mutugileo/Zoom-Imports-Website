import React from 'react';
import { MOTION } from '../../lib/motion';

/**
 * Effect 3 — Vignette.
 *
 * A static corner falloff that pulls the eye to the centre of the frame.
 * Static, so it stays on even under reduced motion — it is depth, not movement.
 *
 * It is fixed to the viewport, so on the homepage it sits over the hero
 * photograph and darkens the frame's whole perimeter — where the car's bonnet
 * and wings actually are. At the old 0.55 with falloff starting at 42% it was
 * veiling the far right edge of the car by ~35% on its own, more than the scrim
 * was there. The clear centre now runs to 58% and the corner tops out at 0.22.
 */
export const Vignette = () => (
  <div
    aria-hidden="true"
    style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 9997,
      background: `radial-gradient(ellipse at center, transparent 58%, rgba(22, 40, 58, ${
        MOTION.vignette.strength * 0.5
      }) 94%, rgba(22, 40, 58, ${MOTION.vignette.strength}) 100%)`,
    }}
  />
);
