import React, { useEffect, useRef } from 'react';
import { MOTION } from '../../lib/motion';

/**
 * Effect 1 — Film grain.
 *
 * Four pre-rendered noise tiles cycled at 8fps. Regenerating noise every
 * frame at 60fps is the obvious approach and it burns a core; cycling a few
 * tiles is visually identical and nearly free.
 */
export const FilmGrain = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const TILE = 128;
    const tiles = Array.from({ length: 4 }, () => {
      const t = document.createElement('canvas');
      t.width = TILE;
      t.height = TILE;
      const tctx = t.getContext('2d');
      const img = tctx.createImageData(TILE, TILE);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      tctx.putImageData(img, 0, 0);
      return t;
    });

    let raf;
    let last = 0;
    let index = 0;
    const interval = 1000 / MOTION.grain.fps;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (time) => {
      raf = requestAnimationFrame(draw);
      if (time - last < interval) return;
      last = time;
      index = (index + 1) % tiles.length;
      const pattern = ctx.createPattern(tiles[index], 'repeat');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9998,
        opacity: MOTION.grain.opacity,
        mixBlendMode: 'overlay',
      }}
    />
  );
};
