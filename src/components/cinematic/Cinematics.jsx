import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { prefersReducedMotion, onReducedMotionChange } from '../../lib/motion';
import { FilmGrain } from './FilmGrain';
import { Particles } from './Particles';
import { Vignette } from './Vignette';
import { ColorTint } from './ColorTint';

/**
 * Composites the ambient effect layers above the page.
 *
 * Only the showroom views get them. Grain, vignette and colour grade are built
 * for large photography on a dark ground; over a light form page they just
 * dirty the corners and add noise to white. Contact, About and Checkout are
 * pages people read and type into, so they stay clean.
 *
 * Motion-driven layers (grain, particles) switch off under reduced-motion and
 * respond live if the visitor changes the setting. Static depth (vignette,
 * tint) stays — it carries no movement.
 */
const CINEMATIC_VIEWS = new Set([
  'home',
  'vehicles',
  'vehicle-detail',
  'parts',
  'part-detail',
]);

export const Cinematics = () => {
  const { currentView } = useApp();
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => onReducedMotionChange(setReduced), []);

  if (!CINEMATIC_VIEWS.has(currentView)) return null;

  const animated = !reduced;

  return (
    <>
      <ColorTint view={currentView} />
      <Particles active={animated} />
      <Vignette />
      <FilmGrain active={animated} />
    </>
  );
};
