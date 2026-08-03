import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, Search } from 'lucide-react';

/**
 * 404.
 *
 * Reachable for the first time now that URLs are real: a mistyped path, or a
 * shared link to a car that has since sold and been removed. The second case is
 * the common one for a dealership, so this does not dead-end — it says what
 * probably happened and points at the two lists that would hold the replacement.
 */
export const NotFoundPage = () => {
  const { navigateTo } = useApp();

  return (
    <div
      className="animate-fade-in"
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '96px var(--gutter) 120px',
        textAlign: 'center',
      }}
    >
      <div className="mono" style={{ color: 'var(--accent)', marginBottom: '12px' }}>
        Error 404
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 600,
          fontSize: 'var(--text-fluid-xl)',
          letterSpacing: '-0.02em',
          color: 'var(--text-dark)',
          lineHeight: 1.1,
          marginBottom: '14px',
        }}
      >
        That page isn&rsquo;t on the lot
      </h1>

      <p
        style={{
          fontSize: 'var(--text-md)',
          lineHeight: 1.7,
          color: 'var(--text-muted)',
          marginBottom: '30px',
        }}
      >
        The link may be mistyped, or the vehicle may have sold and come off the
        site. Both happen — the current stock is one click away.
      </p>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigateTo('vehicles')} className="btn-primary" style={{ padding: '13px 24px' }}>
          Browse vehicles <ArrowRight size={15} />
        </button>
        <button onClick={() => navigateTo('parts')} className="btn-secondary" style={{ padding: '13px 24px' }}>
          <Search size={15} /> Find a part
        </button>
      </div>
    </div>
  );
};
