import React, { useEffect, useRef } from 'react';
import { MOTION } from '../../lib/motion';

/**
 * Effect 2 — Ambient particles.
 *
 * Slow dust drifting through a lit showroom. Deliberately sparse: 26 motes,
 * low opacity, upward drift. Anything denser reads as snow.
 */
export const Particles = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let motes = [];

    const seed = () => {
      motes = Array.from({ length: MOTION.particles.count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.7,
        vy: -(0.2 + Math.random()) * MOTION.particles.speed,
        vx: (Math.random() - 0.5) * MOTION.particles.speed * 0.6,
        o: 0.1 + Math.random() * MOTION.particles.maxOpacity,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    window.addEventListener('resize', resize);

    let raf;
    const draw = (time) => {
      raf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);
      for (const m of motes) {
        m.y += m.vy;
        m.x += m.vx + Math.sin(time * 0.0004 + m.phase) * 0.08;
        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 227, 198, ${m.o})`;
        ctx.fill();
      }
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
        pointerEvents: 'none',
        zIndex: 9996,
      }}
    />
  );
};
