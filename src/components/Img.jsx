import React, { useState, useRef, useEffect, useCallback } from 'react';
import manifest from '../data/imageManifest.json';

/**
 * Catalogue image.
 *
 * If `npm run assets` has been run, this serves local responsive WebP and
 * fades the real image in over an inlined blur placeholder. If it has not,
 * it degrades to the original remote URL — the site works either way, it just
 * looks less finished.
 */
const PHOTO_PENDING = '/media/photo-pending.svg';

export const Img = ({
  src,
  alt = '',
  sizes = '(max-width: 700px) 100vw, 50vw',
  style,
  className = '',
  loading = 'lazy',
  fetchPriority,
  fetchpriority,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  const imgRef = useRef(null);
  const entry = src && !broken ? manifest[src.split('?')[0]] : null;
  const priority = fetchPriority || fetchpriority;

  /**
   * A cached image is already decoded before React attaches onLoad, so the
   * event never fires and `loaded` stays false — leaving the photo at opacity 0
   * with only the 24px blur placeholder showing. It looks like the whole page
   * failed to sharpen, and it gets *worse* on a second visit, because that is
   * when the cache is warm. Ask the element directly on mount instead of
   * waiting to be told.
   */
  const settle = useCallback((node) => {
    imgRef.current = node;
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  // The src can change under a mounted element (paging the grid), and the new
  // one may also come from cache.
  useEffect(() => {
    const node = imgRef.current;
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, [src]);

  const common = {
    alt,
    className,
    loading,
    ...(priority ? { fetchPriority: priority, fetchpriority: priority } : {}),
    decoding: 'async',
    onLoad: () => setLoaded(true),
    // A dead remote URL shows a designed placeholder, never a broken-image icon.
    onError: () => setBroken(true),
    style: {
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      ...style,
    },
    ...rest,
  };

  if (broken) {
    return <img src={PHOTO_PENDING} {...common} onError={undefined} alt={alt || 'Photo pending'} />;
  }

  if (!entry) {
    return <img src={src} {...common} />;
  }

  const widths = Object.keys(entry.srcset).map(Number).sort((a, b) => a - b);
  const srcSet = widths.map((w) => `${entry.srcset[w]} ${w}w`).join(', ');

  return (
    <span
      className={!loaded && !entry.blur ? 'hero-shimmer' : ''}
      style={{
        display: 'block',
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: entry.blur
          ? `url(${entry.blur}) center/cover`
          : 'linear-gradient(135deg, #0a0e14 0%, #171f2c 50%, #0a0e14 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <img
        ref={settle}
        src={entry.srcset[widths[Math.min(1, widths.length - 1)]]}
        srcSet={srcSet}
        sizes={sizes}
        {...common}
        style={{
          ...common.style,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 500ms ease',
        }}
      />
    </span>
  );
};
