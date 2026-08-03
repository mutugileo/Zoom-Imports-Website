import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Failed } from '../components/States';
import { SparePartCard } from '../components/SparePartCard';
import { Pagination } from '../components/Pagination';
import { usePagedList, useScrollToRef } from '../lib/usePagedList';
import { useReveal, revealStyle } from '../lib/useReveal';
import { MAZDA_MODELS, labelForModel, modelOf } from '@shared/data/mazdaModels';
import { buildFitmentIndex } from '@shared/lib/compatibility';
import { PART_CATEGORY_GROUPS } from '@shared/data/partCategories';
import { Search, PlusCircle } from 'lucide-react';

/* Whole rows: four across, three down. */
const PER_PAGE = 12;

/* One marque only, so parts filter by the model they fit, not the make —
   which is why the "all" pill reads "All Mazda models" and not "All makes".
   Mazda *is* the make; these are its models. */
const MODEL_OPTIONS = ['All', ...MAZDA_MODELS.map((m) => m.id)];

/* Categories come from the shared taxonomy now — the shop and the admin form
   used to keep separate hardcoded lists of the same six. */

export const SparePartsPage = () => {
  const { parts, compatibility, navigateTo, formatKES, addToCart, catalogueError, retryCatalogue } = useApp();

  const [make, setMake] = useState('All');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const [gridRef, gridShown] = useReveal();

  /**
   * A part fits a make if its own `compat` field says so, OR if the admin has
   * published a compatibility rule linking that part to that make. Without the
   * second half, rules maintained in the admin portal would never reach the shop.
   */
  /* Keyed on part id, not part name — see shared/lib/compatibility.js for why
     the name was the wrong hinge. The index also reads rule.model rather than
     rule.make: every rule in the book has make "Mazda", so matching the
     customer's chosen model against that column could never be true, and
     nothing published in the admin portal ever reached this filter. */
  const { fitsMake, fitmentFor } = useMemo(() => {
    const { modelsByPart, ruleByPart } = buildFitmentIndex(compatibility, parts);
    return {
      fitsMake: (part, target) => {
        if (target === 'All') return true;
        // The part's own field, resolved so "Mazda2" and "Demio" agree.
        if (modelOf(part.compat) === target) return true;
        const entry = modelsByPart.get(part.id);
        return entry ? entry.all || entry.ids.has(target) : false;
      },
      fitmentFor: (part) => ruleByPart.get(part.id) ?? null,
    };
  }, [compatibility, parts]);

  /* How much sits under each category, so the rail can show where the stock
     actually is rather than 25 identical-looking rows. */
  const countsByCategory = useMemo(() => {
    const counts = new Map();
    for (const p of parts) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    return counts;
  }, [parts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parts.filter((p) => {
      if (!fitsMake(p, make)) return false;
      if (category !== 'All' && p.category !== category) return false;
      if (q && !`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [parts, make, category, query, fitsMake]);

  const { page, pageCount, pageItems, setPage, from, to, total } = usePagedList(
    filtered,
    PER_PAGE,
    `${make}|${category}|${query.trim().toLowerCase()}`
  );

  const [resultsRef, scrollToResults] = useScrollToRef();

  const goToPage = (next) => {
    setPage(next);
    scrollToResults();
  };

  return (
    <div>
      {/* Compatibility engine */}
      <section style={{ background: 'transparent', color: 'var(--text-body)', borderBottom: '1px solid var(--band-line)', padding: '46px var(--gutter) 42px' }}>
        <div className="hero-head" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '28px', marginBottom: '26px' }}>
          <div style={{ minWidth: 0 }}>
            <div className="mono" style={{ color: 'var(--accent)', marginBottom: '12px' }}>
              Fitment check
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)', fontWeight: 600,
                fontSize: 'var(--text-fluid-xl)', letterSpacing: '-0.025em',
                color: 'var(--text-dark)', lineHeight: 1.06, marginBottom: '12px', maxWidth: '20ch',
              }}
            >
              Parts that fit, checked against your model
            </h1>
            <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', maxWidth: '60ch', lineHeight: 1.65 }}>
              Pick your Mazda model to narrow the catalogue to parts we have confirmed against it.
              Not sure? Send us your chassis number and we will check it for you.
            </p>
          </div>

          {/* The counterpart to the lot's seller CTA — for anyone with stock to
              put on the shelf rather than a car to sell. */}
          <a
            href="/sell-parts"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              navigateTo('sell-parts');
            }}
            className="btn-secondary btn-sm hero-cta"
          >
            <PlusCircle size={15} /> List your parts with us
          </a>
        </div>

        {/* On a phone the 28 pills below stack ten rows deep, so the catalogue
            starts a full screen and a half down the page. Same choice, one
            control — the pills stay on wider screens where they scan at a
            glance and cost nothing. */}
        <div className="model-picker">
          <label htmlFor="model-select" className="field-label">Your Mazda model</label>
          <select
            id="model-select"
            className="field"
            value={make}
            onChange={(e) => setMake(e.target.value)}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m}>{m === 'All' ? 'All Mazda models' : labelForModel(m)}</option>
            ))}
          </select>
        </div>

        <div className="model-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {MODEL_OPTIONS.map((m) => {
            const active = make === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMake(m)}
                className={`chip-solid${active ? ' is-active' : ''}`}
                aria-pressed={active}
              >
                {m === 'All' ? 'All Mazda models' : labelForModel(m)}
              </button>
            );
          })}
        </div>
      </section>

      <section style={{ background: 'var(--bg-app)', padding: '30px var(--gutter) 80px' }}>
        <div className="parts-layout" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {/* Sticky and self-scrolling — see .filter-rail */}
          <aside className="parts-sidebar filter-rail" style={{ width: '234px' }}>
            <div className="mono" style={{ color: 'var(--text-dim)', marginBottom: '12px' }}>Category</div>
            <div className="cat-list" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <button
                type="button"
                onClick={() => setCategory('All')}
                className={`cat-btn${category === 'All' ? ' is-active' : ''}`}
                aria-pressed={category === 'All'}
              >
                All categories
                <span className="cat-count">{parts.length}</span>
              </button>

              {PART_CATEGORY_GROUPS.map((g) => (
                <React.Fragment key={g.group}>
                  <div className="mono cat-group">{g.group}</div>
                  {g.categories.map((c) => {
                    const active = category === c;
                    const count = countsByCategory.get(c) ?? 0;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`cat-btn${active ? ' is-active' : ''}${count === 0 ? ' is-empty' : ''}`}
                        aria-pressed={active}
                      >
                        {c}
                        {/* Only where there is stock. A column of zeroes reads
                            as a broken catalogue; a quiet count where it exists
                            reads as a shelf. */}
                        {count > 0 && <span className="cat-count">{count}</span>}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </aside>

          <div ref={resultsRef} style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex', gap: '10px', alignItems: 'center', background: '#fff',
                border: '1px solid var(--border-light)', borderRadius: '10px',
                padding: '11px 16px', marginBottom: '18px',
              }}
            >
              <Search size={17} color="var(--text-dim)" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by part name, brand or number"
                aria-label="Search spare parts"
                style={{ border: 'none', outline: 'none', fontSize: 'var(--text-sm)', color: 'var(--text-dark)', width: '100%', background: 'transparent' }}
              />
            </div>

            {/* aria-live so filtering or paging is announced, not just seen */}
            <div className="mono" style={{ color: 'var(--text-muted)', marginBottom: '18px' }} aria-live="polite">
              {total === 0
                ? 'No parts'
                : pageCount > 1
                  ? `Showing ${from}–${to} of ${total} parts`
                  : `${total} ${total === 1 ? 'part' : 'parts'}`}
              {make !== 'All' && ` confirmed for the ${labelForModel(make)}`}
            </div>

            {catalogueError ? (
              /* Before the empty state, never after: an unreadable store
                 rendering as "nothing matches" tells a customer the yard is
                 empty when it is not. */
              <Failed onRetry={retryCatalogue} />
            ) : filtered.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '60px 30px', textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--text-dark)', marginBottom: '8px' }}>
                  No parts match that combination
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  We stock more than we list. Send the part number on WhatsApp and we will check the shelf.
                </p>
                <button onClick={() => { setMake('All'); setCategory('All'); setQuery(''); }} className="btn-primary">
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div ref={gridRef} className="parts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  {pageItems.map((p, i) => (
                    <SparePartCard
                      key={p.id}
                      part={p}
                      parts={parts}
                      fitment={fitmentFor(p)}
                      formatKES={formatKES}
                      onOpen={() => navigateTo('part-detail', p.id)}
                      onAdd={() => addToCart(p)}
                      style={revealStyle(gridShown, Math.min(i, 5))}
                    />
                  ))}
                </div>

                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onChange={goToPage}
                  label="Spare parts"
                />
              </>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1250px) { .parts-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 950px)  { .parts-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 860px) {
          .parts-layout { flex-direction: column !important; }
          /* Still sticky, just along the top instead of down the side — the
             rail's own max-height and vertical scroll would fight the
             horizontal scroller below, so both are released here.

             Full bleed rather than a floating card: pinned at the top of the
             screen, a rounded panel lets the cards passing underneath show
             through its corners, which reads as a rendering fault. Same
             treatment as .results-bar on the lot. */
          .parts-sidebar {
            width: auto !important;
            align-self: stretch !important;
            top: var(--header-h) !important;
            max-height: none !important;
            overflow-y: visible !important;
            z-index: 20;
            margin-left: calc(var(--gutter) * -1) !important;
            margin-right: calc(var(--gutter) * -1) !important;
            padding: 14px var(--gutter) !important;
            border: none !important;
            border-bottom: 1px solid var(--band-line) !important;
            border-radius: 0 !important;
            background: var(--bg-app) !important;
            box-shadow: none !important;
          }
          /* Categories become a horizontal scroller instead of a tall column.
             The group headings go with the column — laid out in a row they
             read as items rather than labels. */
          .cat-list {
            flex-direction: row !important;
            overflow-x: auto;
            gap: 7px !important;
            padding-bottom: 4px;
          }
          .cat-list .cat-group { display: none; }
          .cat-list button { white-space: nowrap; width: auto; flex-shrink: 0; }
        }
        @media (max-width: 560px) { .parts-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; } }
      `}</style>
    </div>
  );
};
