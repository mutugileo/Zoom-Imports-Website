import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Failed } from '../components/States';
import { useReveal, revealStyle } from '../lib/useReveal';
import { VehicleCard } from '../components/VehicleCard';
import { Pagination } from '../components/Pagination';
import { usePagedList, useScrollToRef } from '../lib/usePagedList';
import { MAZDA_MODEL_GROUPS, isModel } from '@shared/data/mazdaModels';
import { LISTING_FILTERS } from '@shared/lib/format';
import { SlidersHorizontal, X, PlusCircle } from 'lucide-react';

/* Three across, three down. Deep enough to be worth scrolling, short enough
   that the sticky filter rail stays the tallest thing on screen. */
const PER_PAGE = 9;

const SORTS = {
  newest: { label: 'Newest first', fn: (a, b) => b.year - a.year },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  mileage: { label: 'Lowest mileage', fn: (a, b) => a.mileage - b.mileage },
};

const BUDGETS = [
  { id: 'all', label: 'Any price', test: () => true },
  { id: 'under-1m', label: 'Under 1M', test: (v) => v.price < 1000000 },
  { id: '1m-2m', label: '1M – 2M', test: (v) => v.price >= 1000000 && v.price < 2000000 },
  { id: 'over-2m', label: 'Over 2M', test: (v) => v.price >= 2000000 },
];

export const VehiclesPage = () => {
  const { vehicles, navigateTo, formatKES, catalogueError, retryCatalogue } = useApp();

  /* The whole lot, not the filtered slice below — this is what backs the
     hero's claim that every listing carries real paperwork, so it has to
     count the same set the copy is describing. */
  const lotStats = useMemo(
    () => ({
      total: vehicles.length,
      owned: vehicles.filter((v) => v.listing === 'owned').length,
      verified: vehicles.filter((v) => v.odometerVerified).length,
    }),
    [vehicles]
  );

  const [model, setModel] = useState('All');
  const [listing, setListing] = useState('all');
  const [budget, setBudget] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [gridRef, gridShown] = useReveal();

  const filtered = useMemo(() => {
    const budgetTest = BUDGETS.find((b) => b.id === budget)?.test ?? (() => true);
    const listingTest = LISTING_FILTERS.find((l) => l.id === listing)?.match ?? (() => true);
    return vehicles
      /* isModel, not startsWith: a prefix test files every CX-30 under CX-3
         and every Flair Crossover under Flair. */
      .filter((v) => isModel(v.name, model))
      .filter(listingTest)
      .filter(budgetTest)
      .filter((v) => (availableOnly ? v.status === 'Available' : true))
      .sort(SORTS[sort].fn);
  }, [vehicles, model, listing, budget, availableOnly, sort]);

  const activeFilters =
    (model !== 'All' ? 1 : 0) + (listing !== 'all' ? 1 : 0) +
    (budget !== 'all' ? 1 : 0) + (availableOnly ? 1 : 0);

  const { page, pageCount, pageItems, setPage, from, to, total } = usePagedList(
    filtered,
    PER_PAGE,
    /* Sort is in here too: reordering the whole lot makes page three mean
       something entirely different from what it meant a moment ago. */
    `${model}|${listing}|${budget}|${availableOnly}|${sort}`
  );

  const [resultsRef, scrollToResults] = useScrollToRef();

  const goToPage = (next) => {
    setPage(next);
    scrollToResults();
  };

  const reset = () => {
    setModel('All');
    setListing('all');
    setBudget('all');
    setAvailableOnly(false);
  };

  const filterPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <FilterGroup title="Seller">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
          {LISTING_FILTERS.map((l) => (
            <Chip key={l.id} active={listing === l.id} onClick={() => setListing(l.id)}>{l.label}</Chip>
          ))}
        </div>
      </FilterGroup>

      {/* A grouped select, not chips.
          The full Mazda range is 28 models; as chips in a 250px rail that is
          ten rows of pills and the rest of the filters get pushed off the
          screen. The optgroups carry the body-style grouping a buyer already
          thinks in, and one control stays readable on a phone. */}
      <FilterGroup title="Model">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="field"
          aria-label="Filter by Mazda model"
          style={{ width: '100%', padding: '10px 12px', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
        >
          <option value="All">All Mazda models</option>
          {MAZDA_MODEL_GROUPS.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.models.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Budget">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
          {BUDGETS.map((b) => (
            <Chip key={b.id} active={budget === b.id} onClick={() => setBudget(b.id)}>{b.label}</Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="filter-check">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          Hide sold and reserved
        </label>
      </FilterGroup>

      {activeFilters > 0 && (
        <button onClick={reset} className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
          Clear {activeFilters} filter{activeFilters === 1 ? '' : 's'}
        </button>
      )}
    </div>
  );

  return (
    <div>
      <section style={{ background: 'transparent', color: 'var(--text-body)', borderBottom: '1px solid var(--band-line)', padding: '32px var(--gutter) 24px' }}>
        <div className="hero-head" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '28px' }}>
          <div style={{ minWidth: 0 }}>
            <div className="mono" style={{ color: 'var(--accent)', marginBottom: '12px' }}>
              The lot
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)', fontWeight: 600,
                fontSize: 'var(--text-fluid-2xl)', letterSpacing: '-0.025em',
                color: 'var(--text-dark)', lineHeight: 1.05, marginBottom: '14px', maxWidth: '18ch',
              }}
            >
              Every unit here has papers
            </h1>
            <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-muted)', maxWidth: '58ch', lineHeight: 1.65 }}>
              Auction grade, chassis number and inspection status are printed on every listing.
              On cars we own we have checked them ourselves; on seller listings they are the
              seller&rsquo;s figures. Either way, ask and we will send the report.
            </p>
          </div>

          <div className="hero-side" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '26px', flexShrink: 0 }}>
            {/* Sellers are already a first-class listing type in the catalogue —
                this is the way in for one. A real href so the link can be opened
                in a new tab, copied, or advertised on its own. */}
            <a
              href="/sell"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                navigateTo('sell');
              }}
              className="btn-secondary btn-sm hero-cta"
            >
              <PlusCircle size={15} /> List your car with us
            </a>

            {/* What the paragraph above just claimed, counted rather than
                asserted — the same trap TODO.md flags for the homepage's
                "500+ handed over" line: an unbacked round number is worse
                than none, so every value here comes straight off `vehicles`. */}
            <div className="lot-stat-strip">
              <StatItem value={lotStats.total} label="On the lot" />
              <StatItem value={lotStats.owned} label="Owned by us" />
              <StatItem value={lotStats.verified} label="Odometer verified" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--bg-app)', padding: '20px var(--gutter) 36px' }}>
        <div className="lot-layout" style={{ display: 'flex', gap: '34px', alignItems: 'flex-start' }}>
          {/* Filter rail — stays with the visitor the whole way down the lot.
              Sticky behaviour and the self-scroll live in .filter-rail. */}
          <aside className="lot-filters filter-rail" style={{ width: '250px' }}>
            {filterPanel}
          </aside>

          <div ref={resultsRef} style={{ flex: 1, minWidth: 0 }}>
            <div
              className="results-bar"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '14px', marginBottom: '20px', flexWrap: 'wrap',
              }}
            >
              {/* Says which slice of the lot is on screen, not just how many
                  matched — otherwise "18 vehicles" over nine cards reads as a
                  bug. aria-live so a page change is announced. */}
              <div className="mono" style={{ color: 'var(--text-muted)' }} aria-live="polite">
                {total === 0
                  ? 'No vehicles'
                  : pageCount > 1
                    ? `Showing ${from}–${to} of ${total} vehicles`
                    : `${total} ${total === 1 ? 'vehicle' : 'vehicles'}`}
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="btn-secondary filters-toggle"
                  onClick={() => setFiltersOpen(true)}
                  style={{ display: 'none' }}
                >
                  <SlidersHorizontal size={15} /> Filters{activeFilters ? ` (${activeFilters})` : ''}
                </button>

                <label className="mono" style={{ color: 'var(--text-dim)' }} htmlFor="sort">Sort</label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="field"
                  style={{ width: 'auto', padding: '9px 12px', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
                >
                  {Object.entries(SORTS).map(([id, s]) => (
                    <option key={id} value={id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {catalogueError ? (
              /* Before the empty state, never after: an unreadable store
                 rendering as "nothing matches" tells a customer the yard is
                 empty when it is not. */
              <Failed onRetry={retryCatalogue} />
            ) : filtered.length === 0 ? (
              <div
                style={{
                  background: '#fff', border: '1px solid var(--border-light)', borderRadius: '12px',
                  padding: '64px 30px', textAlign: 'center',
                }}
              >
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--text-dark)', marginBottom: '8px' }}>
                  Nothing on the lot matches that
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  Widen the budget, or clear the model and seller filters. We also source to order — tell us the model.
                </p>
                <button onClick={reset} className="btn-primary">Clear filters</button>
              </div>
            ) : (
              <>
                <div ref={gridRef} className="lot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {pageItems.map((v, i) => (
                    <VehicleCard
                      key={v.id}
                      vehicle={v}
                      vehicles={vehicles}
                      formatKES={formatKES}
                      onOpen={() => navigateTo('vehicle-detail', v.id)}
                      style={revealStyle(gridShown, Math.min(i, 5))}
                    />
                  ))}
                </div>

                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onChange={goToPage}
                  label="Vehicle"
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div className="modal-overlay" onClick={() => setFiltersOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', maxWidth: '440px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', color: 'var(--text-dark)' }}>Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                style={{ background: 'var(--bg-cream)', border: 'none', borderRadius: '999px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
            {filterPanel}
            <button onClick={() => setFiltersOpen(false)} className="btn-primary" style={{ width: '100%', marginTop: '22px', padding: '13px' }}>
              Show {filtered.length} {filtered.length === 1 ? 'vehicle' : 'vehicles'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1000px) {
          .lot-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 860px) {
          .lot-filters { display: none !important; }
          .filters-toggle { display: inline-flex !important; }
        }
        /* Two across on a phone. Most visitors arrive on a handset, and one
           card per screen makes a nine-car page feel like an endless scroll —
           you cannot compare two cars without losing your place. */
        @media (max-width: 560px) {
          .lot-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
        }
      `}</style>
    </div>
  );
};

const StatItem = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div
      style={{
        fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-2xl)',
        color: 'var(--text-dark)', lineHeight: 1,
      }}
    >
      {value}
    </div>
    <div className="mono" style={{ color: 'var(--text-dim)', marginTop: '6px', fontSize: 'var(--text-2xs)' }}>
      {label}
    </div>
  </div>
);

const FilterGroup = ({ title, children }) => (
  <div>
    <div className="mono" style={{ color: 'var(--text-dim)', marginBottom: '11px' }}>{title}</div>
    {children}
  </div>
);

/* Styling lives in .chip — inline styles cannot express :hover, which is why
   these chips used to sit inert under the cursor. */
const Chip = ({ active, children, ...rest }) => (
  <button
    type="button"
    {...rest}
    className={`chip${active ? ' is-active' : ''}`}
    aria-pressed={active}
  >
    {children}
  </button>
);
