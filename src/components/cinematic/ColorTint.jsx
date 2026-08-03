import React from 'react';
import { MOTION } from '../../lib/motion';

/**
 * Effect 4 — Colour tints.
 *
 * A per-section colour wash, the way a colourist grades a scene. Each view
 * gets its own grade so moving through the site feels like moving through
 * cuts rather than scrolling one flat document.
 */
const GRADES = {
  home: 'linear-gradient(160deg, rgba(27,85,102,0.55) 0%, transparent 45%, rgba(169,79,29,0.35) 100%)',
  vehicles: 'linear-gradient(200deg, rgba(27,85,102,0.5) 0%, transparent 60%)',
  'vehicle-detail': 'linear-gradient(180deg, rgba(22,40,58,0.6) 0%, transparent 40%, rgba(27,85,102,0.4) 100%)',
  parts: 'linear-gradient(200deg, rgba(47,102,144,0.35) 0%, transparent 55%)',
  'part-detail': 'linear-gradient(180deg, rgba(47,102,144,0.3) 0%, transparent 50%)',
  checkout: 'linear-gradient(180deg, rgba(27,85,102,0.35) 0%, transparent 55%)',
  about: 'linear-gradient(150deg, rgba(169,79,29,0.35) 0%, transparent 55%)',
  contact: 'linear-gradient(150deg, rgba(27,85,102,0.4) 0%, transparent 55%)',
};

export const ColorTint = ({ view }) => (
  <div
    aria-hidden="true"
    style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 9995,
      opacity: MOTION.tint.opacity,
      background: GRADES[view] || GRADES.home,
      mixBlendMode: 'soft-light',
      transition: 'background 900ms ease, opacity 900ms ease',
    }}
  />
);
