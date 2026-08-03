import React from 'react';
import { AlertCircle, PackageOpen, RotateCw } from 'lucide-react';

/**
 * The three states every list has and none of them had.
 *
 * Data is read synchronously today, so `Loading` never shows on the storefront —
 * it exists because the moment reads become asynchronous, every call site needs
 * a skeleton and adding them then means touching every page again. `Empty` and
 * `Failed` are reachable right now: a filter combination that matches nothing,
 * or storage that is unreadable in private mode.
 *
 * A skeleton rather than a spinner: the lists are card grids of known shape, so
 * the layout can be reserved and nothing jumps when the data lands.
 */

const Shell = ({ children, minHeight = '220px' }) => (
  <div
    style={{
      gridColumn: '1 / -1',
      minHeight,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '10px',
      padding: '46px 24px',
      background: 'var(--bg-card)',
      border: '1px solid var(--band-line)',
      borderRadius: '12px',
    }}
  >
    {children}
  </div>
);

/** Card-shaped placeholders that hold the grid open while data resolves. */
export const Loading = ({ count = 6, height = 300, label = 'Loading' }) => (
  <>
    <span className="sr-only" role="status" aria-live="polite">{label}…</span>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="skeleton"
        aria-hidden="true"
        style={{ minHeight: `${height}px`, borderRadius: '12px' }}
      />
    ))}
  </>
);

/**
 * Nothing matched. `onReset` is the important part — a dead end with no way back
 * is the most common way a filtered list loses someone.
 */
export const Empty = ({
  title = 'Nothing here yet',
  message = 'Try widening your filters.',
  onReset,
  resetLabel = 'Clear filters',
}) => (
  <Shell>
    <PackageOpen size={26} color="var(--text-muted)" aria-hidden="true" />
    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-dark)' }}>
      {title}
    </div>
    <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', maxWidth: '44ch', lineHeight: 1.6 }}>
      {message}
    </p>
    {onReset && (
      <button onClick={onReset} className="btn-secondary" style={{ marginTop: '6px' }}>
        {resetLabel}
      </button>
    )}
  </Shell>
);

/**
 * Something broke. Says what failed and offers the one action that ever helps,
 * rather than rendering an empty grid that reads as "no stock" — a dealership
 * showing zero cars because of a storage error is the worst possible failure.
 */
export const Failed = ({
  title = 'We could not load this',
  message = 'The connection dropped or your browser blocked local storage. Nothing is lost — try again.',
  onRetry,
}) => (
  <Shell>
    <AlertCircle size={26} color="var(--accent)" aria-hidden="true" />
    <div role="alert" style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-dark)' }}>
      {title}
    </div>
    <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', maxWidth: '46ch', lineHeight: 1.6 }}>
      {message}
    </p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary" style={{ marginTop: '6px' }}>
        <RotateCw size={15} /> Try again
      </button>
    )}
  </Shell>
);
