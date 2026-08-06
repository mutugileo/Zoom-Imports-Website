import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { RotateCw, Loader2, ImageOff, Maximize2, Minimize2, Info, X, CheckCircle2 } from 'lucide-react';

/**
 * Drag-to-rotate turntable viewer with Hotspots and Fullscreen Inspection Mode.
 */

export const FRAME_COUNT = 12;

const pad = (n) => String(n).padStart(2, '0');
const framePath = (slug, i) => `/media/360/${slug}/frame-${pad(i + 1)}.webp`;

/**
 * Hotspots, built from the vehicle's own record.
 *
 * These were four fixed cards asserting "Zero oil leaks, fully serviced",
 * "Grade 4.5 Condition", "85% Tread Depth" and an odometer "verified against
 * Japan Ministry database records" — on every car, whatever its record said,
 * including cars with no grade and no inspection on file. That is a condition
 * report nobody carried out, shown to someone deciding whether to spend two
 * million shillings.
 *
 * Everything below is a fact already stored against the vehicle. An entry that
 * has no data is not rendered at all, because the honest thing to say about an
 * uninspected car is nothing.
 */
const buildHotspots = (v) => {
  if (!v) return [];
  const out = [];

  if (v.grade) {
    out.push({
      id: 'grade', label: 'Auction grade', x: 48, y: 35, frames: [0, 1, 11],
      title: 'Japanese auction grade',
      status: v.grade,
      desc: 'The grade the inspector at the Japanese auction house assigned this car before export. It is recorded on the auction sheet, not assessed by us.',
    });
  }

  if (v.inspection) {
    out.push({
      id: 'inspection', label: 'Inspection', x: 52, y: 45, frames: [3, 4, 5],
      title: 'Pre-export inspection',
      status: v.inspection,
      desc: 'The inspection this car was put through before it shipped. Ask us for the certificate and we will send it over.',
    });
  }

  if (v.mileage != null) {
    out.push({
      id: 'odometer', label: 'Odometer', x: 36, y: 52, frames: [4, 5, 6],
      title: 'Odometer reading',
      status: `${Number(v.mileage).toLocaleString()} km`,
      /* The claim is made only when the record carries the flag. */
      desc: v.odometerVerified
        ? 'This reading has been verified against the export documentation.'
        : 'Reading as shown on the clock. It has not been independently verified — ask us before you rely on it.',
    });
  }

  if (v.chassis || v.port || v.dutyPaid) {
    out.push({
      id: 'paperwork', label: 'Paperwork', x: 28, y: 68, frames: [7, 8, 9, 10],
      title: 'Import paperwork',
      status: v.dutyPaid ? 'Duty paid' : 'Duty outstanding',
      desc: [
        v.chassis ? `Chassis ${v.chassis}.` : null,
        v.port ? `Landed at ${v.port}.` : null,
        v.dutyPaid
          ? 'Import duty is settled, so the price you see is the price to drive it away.'
          : 'Duty is not yet settled on this unit — talk to us about what that means for the final figure.',
      ].filter(Boolean).join(' '),
    });
  }

  return out;
};

export const Viewer360 = ({ slug, fallbackImg, gallery = [], vehicle = null, alt, height = 460 }) => {
  const [status, setStatus] = useState('probing'); // probing | ready | unavailable
  const [loaded, setLoaded] = useState(0);
  const [frame, setFrame] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hinted, setHinted] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  // Which uploaded photo is showing when there is no turntable capture.
  const [photo, setPhoto] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const containerRef = useRef(null);
  const dragState = useRef({ startX: 0, startFrame: 0, moved: false });

  const frames = useMemo(
    () => Array.from({ length: FRAME_COUNT }, (_, i) => framePath(slug, i)),
    [slug]
  );

  useEffect(() => {
    let cancelled = false;
    setStatus('probing');
    setLoaded(0);
    setFrame(0);

    const probe = new Image();
    probe.onload = () => {
      if (cancelled) return;
      setStatus('ready');
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
    if (e.target.closest('.hotspot-pin') || e.target.closest('.hotspot-card')) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragState.current = { startX: e.clientX, startFrame: frame, moved: false };
    setDragging(true);
    setHinted(true);
  };

  const onPointerMove = (e) => {
    if (!dragging || status !== 'ready') return;
    const dx = e.clientX - dragState.current.startX;
    const width = containerRef.current?.clientWidth || 600;
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
    if (e.key === 'Escape' && isFullScreen) {
      setIsFullScreen(false);
      return;
    }
    if (status !== 'ready') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); rotateBy(1); setHinted(true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); rotateBy(-1); setHinted(true); }
  };

  const hotspots = useMemo(() => buildHotspots(vehicle), [vehicle]);

  const visibleHotspots = useMemo(
    () => hotspots.filter((h) => h.frames.includes(frame)),
    [hotspots, frame]
  );

  const shellStyle = {
    position: isFullScreen ? 'fixed' : 'relative',
    inset: isFullScreen ? 0 : undefined,
    zIndex: isFullScreen ? 1000 : undefined,
    width: '100%',
    height: isFullScreen ? '100vh' : `${height}px`,
    borderRadius: isFullScreen ? 0 : '14px',
    overflow: 'hidden',
    background: 'radial-gradient(120% 90% at 50% 15%, var(--ink-raised) 0%, var(--ink) 70%)',
    border: isFullScreen ? 'none' : '1px solid rgba(255,255,255,0.1)',
    touchAction: 'none',
    userSelect: 'none',
  };

  /* Warm the neighbouring shots so tapping a dot swaps instantly instead of
     showing a gap while the next photo is fetched. */
  useEffect(() => {
    if (status !== 'unavailable' || gallery.length < 2) return;
    [photo + 1, photo - 1].forEach((i) => {
      const src = gallery[(i + gallery.length) % gallery.length];
      if (src) { const im = new Image(); im.src = src; }
    });
  }, [status, gallery, photo]);

  if (status === 'unavailable') {
    /* No turntable capture for this car — so show the photographs the yard
       actually uploaded. Falling back to `fallbackImg` alone meant a listing
       with six photos showed one of them, and the other five existed only in
       the admin. */
    const shots = gallery.length ? gallery : (fallbackImg ? [fallbackImg] : []);
    const shot = shots[Math.min(photo, shots.length - 1)] ?? fallbackImg;

    return (
      <div style={shellStyle}>
        {/* The hero of the page, so it loads eagerly — lazy here would leave a
            blank frame at the top of every listing. Decoding is handed off the
            main thread so a large photo cannot stall the first paint. */}
        <img
          src={shot}
          alt={shots.length > 1 ? `${alt} — photo ${photo + 1} of ${shots.length}` : alt}
          loading="eager"
          decoding="async"
          fetchpriority="high"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.95 }}
        />

        {shots.length > 1 && (
          <div
            style={{
              position: 'absolute', right: '14px', bottom: '14px',
              display: 'flex', gap: '6px', padding: '7px 9px', borderRadius: '999px',
              background: 'rgba(20,23,28,0.72)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            {shots.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setPhoto(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === photo}
                style={{
                  width: '9px', height: '9px', padding: 0, borderRadius: '999px', cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.5)',
                  background: i === photo ? '#fff' : 'transparent',
                }}
              />
            ))}
          </div>
        )}

        <div
          style={{
            position: 'absolute', left: '14px', bottom: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '7px 12px', borderRadius: '999px',
            background: 'rgba(20,23,28,0.72)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.14)',
            font: '500 11px/1 var(--font-mono)', letterSpacing: '0.06em',
            color: 'rgba(238,242,247,0.82)', textTransform: 'uppercase',
          }}
        >
          <ImageOff size={13} />
          {shots.length > 1 ? `${shots.length} photos · turntable pending` : 'Single photo · turntable pending'}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`${alt} — 360 degree view, frame ${frame + 1} of ${FRAME_COUNT}.`}
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

      {/* Hotspots layer */}
      {status === 'ready' && visibleHotspots.map((h) => {
        const isActive = activeHotspot === h.id;
        return (
          <React.Fragment key={h.id}>
            <button
              type="button"
              className="hotspot-pin"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot(isActive ? null : h.id);
              }}
              aria-label={`Inspect ${h.label}`}
            >
              <Info size={14} />
            </button>
            {isActive && (
              <div
                className="hotspot-card"
                style={{
                  left: `min(calc(${h.x}% - 120px), calc(100% - 250px))`,
                  top: `calc(${h.y}% + 32px)`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--accent-light)', textTransform: 'uppercase' }}>
                    {h.label}
                  </span>
                  <button
                    onClick={() => setActiveHotspot(null)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff', marginBottom: '4px' }}>
                  {h.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--verify)', marginBottom: '6px' }}>
                  <CheckCircle2 size={12} /> {h.status}
                </div>
                <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.4, color: 'rgba(238,242,247,0.75)' }}>
                  {h.desc}
                </p>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Top Controls Bar */}
      <div
        style={{
          position: 'absolute', top: '14px', right: '14px',
          display: 'flex', alignItems: 'center', gap: '8px', zIndex: 30,
        }}
      >
        <button
          type="button"
          onClick={() => setIsFullScreen((prev) => !prev)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px', borderRadius: '8px',
            background: 'rgba(20,23,28,0.85)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: '#fff', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
          }}
          aria-label={isFullScreen ? 'Exit Full Screen' : 'Full Screen 360 View'}
        >
          {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          <span className="mono" style={{ fontSize: '11px' }}>{isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* Frame counter */}
      <div
        style={{
          position: 'absolute', right: '14px', bottom: '14px',
          padding: '7px 12px', borderRadius: '8px',
          background: 'rgba(20,23,28,0.75)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.14)',
          font: '500 12px/1 var(--font-mono)', letterSpacing: '0.08em',
          color: '#f2e3c6', zIndex: 30,
        }}
      >
        {pad(frame + 1)} <span style={{ opacity: 0.45 }}>/ {FRAME_COUNT}</span>
      </div>

      {/* Drag affordance */}
      <div
        style={{
          position: 'absolute', left: '14px', bottom: '14px',
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '7px 12px', borderRadius: '999px',
          background: 'rgba(20,23,28,0.72)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.14)',
          font: '500 11px/1 var(--font-mono)', letterSpacing: '0.06em',
          color: 'rgba(238,242,247,0.82)', textTransform: 'uppercase',
          opacity: hinted ? 0 : 1,
          transform: hinted ? 'translateY(6px)' : 'none',
          transition: 'opacity 500ms ease, transform 500ms ease',
          pointerEvents: 'none', zIndex: 30,
        }}
      >
        <RotateCw size={13} /> ↔ Drag horizontally to rotate 360°
      </div>

      {status === 'ready' && loaded < FRAME_COUNT && (
        <div
          style={{
            position: 'absolute', top: 0, left: 0, height: '2px',
            width: `${(loaded / FRAME_COUNT) * 100}%`,
            background: 'linear-gradient(90deg, transparent, var(--accent-light))',
            transition: 'width 240ms ease',
            zIndex: 35,
          }}
        />
      )}
    </div>
  );
};

