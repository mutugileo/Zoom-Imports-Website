import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { pagesToShow } from '@shared/lib/paging';

/* The page-window arithmetic lives in shared/ — the portal pages lists too,
   and two copies of the elision rule would drift. */

/**
 * `label` names what is being paged ("vehicles", "parts") so the control is
 * distinguishable to a screen reader on a page that could hold more than one.
 */
export const Pagination = ({ page, pageCount, onChange, label = 'results' }) => {
  if (pageCount <= 1) return null;

  const go = (next) => {
    const clamped = Math.min(pageCount, Math.max(1, next));
    if (clamped !== page) onChange(clamped);
  };

  return (
    <nav className="pager" aria-label={`${label} pagination`}>
      <button
        type="button"
        className="pager-btn"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
        <span className="pager-btn-label">Prev</span>
      </button>

      {pagesToShow(page, pageCount).map((p) =>
        typeof p === 'number' ? (
          <button
            key={p}
            type="button"
            className="pager-btn"
            onClick={() => go(p)}
            /* aria-current is the whole announcement — an extra "selected"
               label would have a screen reader say it twice. */
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Page ${p} of ${pageCount}`}
          >
            {p}
          </button>
        ) : (
          <span key={p} className="pager-gap" aria-hidden="true">
            &hellip;
          </span>
        )
      )}

      <button
        type="button"
        className="pager-btn"
        onClick={() => go(page + 1)}
        disabled={page === pageCount}
        aria-label="Next page"
      >
        <span className="pager-btn-label">Next</span>
        <ChevronRight size={15} />
      </button>
    </nav>
  );
};
