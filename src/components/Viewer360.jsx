import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { RotateCw, Loader2, ImageOff } from 'lucide-react';

/**
 * Drag-to-rotate turntable viewer.
 *
 * Frames live at /media/360/<slug>/frame-01.webp … frame-<N>.webp.
 * Until real turntable frames are dropped in, the viewer detects that frame 1
 * is missing and falls back to the vehicle's still — an honest single photo
 * rather than a spinner that never resolves.
 *
 * To shoot frames: put the car on a turntable (or walk a fixed radius around
 * it), take FRAME_COUNT evenly-spaced photos, then run
 *   npm run frames -- --video lot-clip.mp4 --slug toyota-axio-2015
 */

export const FRAME_COUNT = 12;

const pad = (n) => String(n).padStart(2, '0');

const framePath = (slug, i) => `/media/360/${slug}/frame-${pad(i + 1)}.webp`;

export const Viewer360 = ({ slug, fallbackImg, alt, height = 460 }) => {
  const [status, setStatus] = useState('probing'); // probing | ready | unavailable
  const [loaded, setLoaded] = useState(0);
  const [frame, setFrame] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hinted, setHinted] = useState(false);

  const containerRef = useRef(null);
  const dragState = useRef({ startX: 0, startFrame: 0, moved: false });

  const frames = useMemo(
    () => Array.from({ length: FRAME_COUNT }, (_, i) => framePath(slug, i)),
    [slug]
  );

  // Probe frame 1. If it is not there, no turntable set exists for this car.
  useEffect(() => {
    let cancelled = false;
    setStatus('probing');
    setLoaded(0);
    setFrame(0);

    const probe = new Image();
    probe.onload = () => {
      if (cancelled) return;
      setStatus('ready');
      // Warm the rest so the first spin is not a slideshow of blanks.
      frames.slice(1).forEach((src) => {
        const img = new Image();
        img.onload = () => !cancelled && setLoaded((n) => n + 1);
        img.onerror = () => !cancelled && setLoaded((n) => n + 1);
        img.src = src;
      });
      setLoaded(1);
    };
    probe.onerror = () => {
      if (!cancelled) setStatus('unavailable');
    };
    probe.src = frames[0];

    return () => {
      cancelled = true;
    };
  }, [frames]);

  const rotateBy = useCallback((steps) => {
    setFrame((f) => (((f + steps) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT);
  }, []);

  const onPointerDown = (e) => {
    if (status !== 'ready') return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragState.current = { startX: e.clientX, startFrame: frame, moved: false };
    setDragging(true);
    setHinted(true);
  };

  const onPointerMove = (e) => {
    if (!dragging || status !== 'ready') return;
    const dx = e.clientX - dragState.current.startX;
    const width = containerRef.current?.clientWidth || 600;
    // One full drag across the viewer = one full revolution.
    const steps = Math.round((dx / width) * FRAME_COUNT * 1.6);
    if (steps !== 0) dragState.current.moved = true;
    const next = dragState.current.startFrame + steps;
    setFrame((((next % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT));
  };

  const endDrag = (e) => {
    if (!dragging) return;
    e.currentTarget?.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e) => {
    if (status !== 'ready') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); rotateBy(1); setHinted(true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); rotateBy(-1); setHinted(true); }
  };

  const shellStyle = {
    position: 'relative',
    width: '100%',
    height: `${height}px`,
    borderRadius: '14px',
    overflow: 'hidden',
    background: 'radial-gradient(120% 90% at 50% 15%, #1e3449 0%, #16283a 70%)',
    border: '1px solid rgba(255,255,255,0.1)',
    touchAction: 'none',
    userSelect: 'none',
  };

  // No frame set yet — show the still, labelled honestly.
  if (status === 'unavailable') {
    return (
      <div style={shellStyle}>
        <img
          src={fallbackImg}
          alt={alt}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }}
        />
        <div
          style={{
            position: 'absolute', left: '14px', bottom: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 12px', borderRadius: '999px',
            background: 'rgba(22,40,58,0.72)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.14)',
            font: '500 11px/1 var(--font-mono)', letterSpacing: '0.06em',
            color: 'rgba(238,242,247,0.82)', textTransform: 'uppercase',
          }}
        >
          <ImageOff size={13} /> Single photo · turntable pending
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`${alt} — 360 degree view, frame ${frame + 1} of ${FRAME_COUNT}. Use left and right arrow keys to rotate.`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ ...shellStyle, cursor: dragging ? 'grabbing' : 'grab' }}
    >
      {status === 'probing' ? (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'rgba(238,242,247,0.6)',
        }}>
          <Loader2 size={22} className="spin" />
        </div>
      ) : (
        frames.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: i === frame ? 1 : 0,
              pointerEvents: 'none',
            }}
          />
        ))
      )}

      {/* Frame counter — reads like a lot inspection, not a gallery */}
      <div
        style={{
          position: 'absolute', right: '14px', bottom: '14px',
          padding: '7px 12px', borderRadius: '8px',
          background: 'rgba(22,40,58,0.75)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.14)',
          font: '500 12px/1 var(--font-mono)', letterSpacing: '0.08em',
          color: '#f2e3c6',
        }}
      >
        {pad(frame + 1)} <span style={{ opacity: 0.45 }}>/ {FRAME_COUNT}</span>
      </div>

      {/* Drag affordance — retires once the visitor has spun it */}
      <div
        style={{
          position: 'absolute', left: '14px', bottom: '14px',
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 12px', borderRadius: '999px',
          background: 'rgba(22,40,58,0.72)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.14)',
          font: '500 11px/1 var(--font-mono)', letterSpacing: '0.06em',
          color: 'rgba(238,242,247,0.82)', textTransform: 'uppercase',
          opacity: hinted ? 0 : 1,
          transform: hinted ? 'translateY(6px)' : 'none',
          transition: 'opacity 500ms ease, transform 500ms ease',
          pointerEvents: 'none',
        }}
      >
        <RotateCw size={13} /> Drag to rotate
      </div>

      {status === 'ready' && loaded < FRAME_COUNT && (
        <div
          style={{
            position: 'absolute', top: 0, left: 0, height: '2px',
            width: `${(loaded / FRAME_COUNT) * 100}%`,
            background: 'linear-gradient(90deg, transparent, #f2a565)',
            transition: 'width 240ms ease',
          }}
        />
      )}
    </div>
  );
};
