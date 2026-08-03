import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search, ShoppingCart, Menu, X, MapPin, Phone,
  ArrowUpRight, MessageCircle,
} from 'lucide-react';
import { Img } from './Img';
import { pathFor } from '../lib/router';

/**
 * Views the header may float over. Only the homepage qualifies: its hero is a
 * full-bleed image with 120px of top padding, so the artwork runs behind the
 * header with room to spare.
 *
 * The other dark-topped views (vehicles, parts, vehicle detail) open their ink
 * bands with only 26–46px of padding — floating over those would bury their
 * titles. Adding overlay there means giving each one header-height padding.
 */
const OVERLAY_VIEWS = new Set(['home']);

const NAV = [
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'parts', label: 'Spare Parts' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

const MOBILE_NAV = [
  {
    label: 'Shop',
    items: [
      { id: 'vehicles', label: 'Vehicles', note: 'Browse inspected imports' },
      { id: 'parts', label: 'Spare parts', note: 'Search by part or Mazda model' },
      { id: 'sell', label: 'Sell a vehicle', note: 'List your car with the yard' },
      { id: 'sell-parts', label: 'Sell spare parts', note: 'Offer stock to our counter' },
    ],
  },
  {
    label: 'Company',
    items: [
      { id: 'about', label: 'About Zoom Imports', note: 'How sourcing and checks work' },
      { id: 'contact', label: 'Contact', note: 'Directions, hours and enquiries' },
    ],
  },
];

export const Header = () => {
  const {
    currentView, navigateTo, cartItemCount, setIsCartOpen,
    vehicles, parts, formatKES, contact, waNumber,
  } = useApp();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const menuToggleRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The mobile menu is a real modal surface: background content cannot scroll
  // or receive focus, focus stays inside the panel, and closing returns the
  // visitor to the control that opened it.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const panel = menuRef.current;
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const previousOverflow = document.body.style.overflow;
    const previousMainHidden = main?.getAttribute('aria-hidden');
    const previousFooterHidden = footer?.getAttribute('aria-hidden');
    const previousMainInert = Boolean(main?.inert);
    const previousFooterInert = Boolean(footer?.inert);

    document.body.style.overflow = 'hidden';
    if (main) {
      main.inert = true;
      main.setAttribute('aria-hidden', 'true');
    }
    if (footer) {
      footer.inert = true;
      footer.setAttribute('aria-hidden', 'true');
    }

    const focusable = () => Array.from(panel?.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) ?? []).filter((node) => node.offsetParent !== null);

    const focusFrame = requestAnimationFrame(() => (focusable()[0] ?? panel)?.focus());

    const keepFocusInside = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const nodes = focusable();
      if (!nodes.length) {
        event.preventDefault();
        panel?.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel?.addEventListener('keydown', keepFocusInside);
    return () => {
      cancelAnimationFrame(focusFrame);
      panel?.removeEventListener('keydown', keepFocusInside);
      document.body.style.overflow = previousOverflow;
      if (main) {
        main.inert = previousMainInert;
        if (previousMainHidden == null) main.removeAttribute('aria-hidden');
        else main.setAttribute('aria-hidden', previousMainHidden);
      }
      if (footer) {
        footer.inert = previousFooterInert;
        if (previousFooterHidden == null) footer.removeAttribute('aria-hidden');
        else footer.setAttribute('aria-hidden', previousFooterHidden);
      }
      menuToggleRef.current?.focus();
    };
  }, [menuOpen]);

  // Close the results panel on an outside click or Escape.
  useEffect(() => {
    const onDown = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setMenuOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Float over the artwork at rest; become solid the moment the page moves,
  // because what scrolls up behind the header is not guaranteed to be dark.
  const floating = OVERLAY_VIEWS.has(currentView);
  const overlay = floating && !condensed && !menuOpen;

  const q = query.trim().toLowerCase();
  const matchingVehicles = q
    ? vehicles.filter((v) => `${v.make} ${v.name} ${v.body}`.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const matchingParts = q
    ? parts.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const hasResults = matchingVehicles.length > 0 || matchingParts.length > 0;

  const go = (view, id) => {
    navigateTo(view, id);
    setSearchOpen(false);
    setMenuOpen(false);
    setQuery('');
  };

  return (
    <header
      style={{
        position: floating ? 'fixed' : 'sticky',
        top: 0, left: 0, right: 0, zIndex: 500,
      }}
    >
      {/* Scrim for the overlay state. The hero's own gradient is only 0.34 at
          the very top — not enough on its own for text this small. */}
      {floating && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '150px',
            background: 'linear-gradient(180deg, rgba(22,40,58,0.88) 0%, rgba(22,40,58,0.62) 55%, rgba(22,40,58,0) 100%)',
            opacity: overlay ? 1 : 0,
            transition: 'opacity 320ms ease',
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Dealership rail — the facts a buyer checks first */}
      <div
        style={{
          position: 'relative',
          /* Two grounds: transparent over the hero photo, silver everywhere else.
             The accent has to swap with it — --accent-light is built for ink and
             measures 1.9:1 on silver, --accent is 2.7:1 on ink. Neither survives
             both, so each state gets the one that was measured for it. */
          background: overlay ? 'transparent' : 'var(--bg-cream)',
          color: overlay ? 'rgba(238,242,247,0.86)' : 'var(--text-muted)',
          borderBottom: overlay ? '1px solid transparent' : '1px solid var(--band-line)',
          padding: '0 var(--gutter)',
          height: condensed ? 0 : '34px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          // Single declaration — see the note on the main bar below.
          transition:
            'height 320ms cubic-bezier(0.22, 1, 0.36, 1), background 320ms ease, color 320ms ease',
        }}
      >
        <div className="mono header-rail-location" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-xs)' }}>
          <MapPin size={12} color={overlay ? 'var(--accent-light)' : 'var(--accent)'} />
          <span style={{ color: overlay ? 'var(--accent-light)' : 'var(--accent)' }}>Mombasa Road</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span>Showroom &amp; Spares Depot</span>
        </div>
        <div className="mono header-rail-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 'var(--text-xs)' }}>
          <span style={{ display: 'none' }} />
          <span>Mon–Sat 8:00–18:00</span>
          <a href={`tel:${contact.phone.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="link-draw">
            <Phone size={12} /> {contact.phone}
          </a>
        </div>
      </div>

      {/* Main bar */}
      <div
        style={{
          position: 'relative',
          background: overlay ? 'transparent' : 'rgba(255,255,255,0.92)',
          /* The bar is already 92% opaque, so a heavy blur only smeared the few
             pixels of content visible through it as you scrolled past — motion
             blur on a stationary page. 4px keeps the frosted edge. */
          backdropFilter: overlay ? 'none' : 'blur(4px)',
          WebkitBackdropFilter: overlay ? 'none' : 'blur(4px)',
          borderBottom: `1px solid ${overlay ? 'transparent' : 'var(--border-light)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          padding: '0 var(--gutter)',
          height: condensed ? '62px' : '76px',
          // One declaration: a second `transition` key would silently drop the first,
          // leaving the overlay→solid swap to snap while only the height eased.
          transition:
            'height 320ms cubic-bezier(0.22, 1, 0.36, 1), background 320ms ease, border-color 320ms ease',
        }}
      >
        {/* Brand */}
        <button
          onClick={() => go('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, flexShrink: 0 }}
          aria-label="Zoom Imports — home"
        >
          <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'var(--text-2xl)', color: overlay ? '#ffffff' : 'var(--text-dark)', lineHeight: 1.05, transition: 'color 320ms ease' }}>
            Zoom Imports
          </div>
          <div className="mono" style={{ fontSize: 'var(--text-2xs)', color: overlay ? 'rgba(238,242,247,0.82)' : 'var(--text-dim)', transition: 'color 320ms ease' }}>
            Nairobi · Est. 2014
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          {NAV.map((item) => {
            const active = currentView === item.id;
            return (
              <a
                key={item.id}
                href={pathFor(item.id)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  go(item.id);
                }}
                className="link-draw"
                aria-current={active ? 'page' : undefined}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-base)',
                  fontWeight: active ? 600 : 500,
                  color: overlay
                    ? (active ? '#f4e3c6' : 'rgba(255,255,255,0.92)')
                    : (active ? 'var(--primary)' : 'var(--text-body)'),
                  padding: 0,
                  transition: 'color 320ms ease',
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Search + cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '0 1 auto' }}>
          <div
            ref={searchRef}
            style={{ position: 'relative', width: 'clamp(190px, 19vw, 284px)' }}
            className="search-wrap"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: overlay ? 'rgba(255,255,255,0.14)' : 'var(--bg-cream)',
                border: `1px solid ${overlay ? 'rgba(255,255,255,0.28)' : 'var(--border-light)'}`,
                borderRadius: '999px',
                padding: '8px 14px',
                minWidth: 0,
                transition: 'background 320ms ease, border-color 320ms ease',
              }}
            >
              <Search size={15} color={overlay ? 'rgba(238,242,247,0.8)' : 'var(--text-dim)'} />
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search vehicles or parts"
                aria-label="Search vehicles or parts"
                className={overlay ? 'search-on-ink' : undefined}
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 'var(--text-sm)', color: overlay ? '#ffffff' : 'var(--text-dark)',
                  width: '100%', minWidth: 0,
                }}
              />
            </div>

            {searchOpen && q && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 'min(380px, 78vw)', background: '#fff',
                  border: '1px solid var(--border-light)', borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 20,
                }}
              >
                {!hasResults ? (
                  <div style={{ padding: '18px', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                    Nothing matches “{query}”. Try a make, a model or a part name.
                  </div>
                ) : (
                  <>
                    {matchingVehicles.length > 0 && (
                      <div style={{ padding: '10px 0 6px' }}>
                        <div className="mono" style={{ padding: '0 14px 6px', color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>
                          Vehicles
                        </div>
                        {matchingVehicles.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => go('vehicle-detail', v.id)}
                            style={rowStyle}
                          >
                            <span style={thumbStyle}><Img src={v.img} alt={`${v.name} thumbnail`} sizes="38px" /></span>
                            <span style={{ flex: 1, textAlign: 'left' }}>
                              <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)' }}>{v.name}</span>
                              <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>{v.year} · {v.mileage}</span>
                            </span>
                            <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>{formatKES(v.price)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {matchingParts.length > 0 && (
                      <div style={{ padding: '6px 0 10px', borderTop: matchingVehicles.length ? '1px solid var(--border-light)' : 'none' }}>
                        <div className="mono" style={{ padding: '8px 14px 6px', color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>
                          Spare parts
                        </div>
                        {matchingParts.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => go('part-detail', p.id)}
                            style={rowStyle}
                          >
                            <span style={thumbStyle}><Img src={p.img} alt={`${p.name} thumbnail`} sizes="38px" /></span>
                            <span style={{ flex: 1, textAlign: 'left' }}>
                              <span style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)' }}>{p.name}</span>
                              <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>{p.brand}</span>
                            </span>
                            <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>{formatKES(p.promo || p.price)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open cart, ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}`}
            style={{
              position: 'relative', background: 'var(--primary)', border: 'none',
              width: '40px', height: '40px', borderRadius: '999px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'background 0.25s ease, transform 0.15s ease',
            }}
          >
            <ShoppingCart size={17} color="#fff" />
            {cartItemCount > 0 && (
              <span
                className="mono"
                style={{
                  position: 'absolute', top: '-3px', right: '-3px',
                  background: 'var(--accent)', color: '#fff', fontSize: 'var(--text-xs)',
                  minWidth: '19px', height: '19px', borderRadius: '999px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  letterSpacing: 0, padding: '0 5px', border: '2px solid #fff',
                }}
              >
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            ref={menuToggleRef}
            className="nav-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            style={{
              display: 'none', background: 'none',
              border: `1px solid ${overlay ? 'rgba(255,255,255,0.34)' : 'var(--border-medium)'}`,
              color: overlay ? '#ffffff' : 'var(--text-dark)',
              width: '40px', height: '40px', borderRadius: '8px', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              visibility: menuOpen ? 'hidden' : 'visible',
            }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <div
          className="nav-overlay"
          style={{ top: condensed ? '62px' : '110px' }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMenuOpen(false);
          }}
        >
          <nav
            id="mobile-navigation"
            ref={menuRef}
            className="nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            tabIndex={-1}
          >
            <div className="nav-sheet-head">
              <div>
                <div className="mono nav-sheet-kicker">Browse Zoom Imports</div>
                <h2 id="mobile-navigation-title">What are you looking for?</h2>
              </div>
              <button
                type="button"
                className="nav-sheet-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a vehicle or spare part"
                aria-label="Search vehicles or spare parts"
                aria-controls="mobile-search-results"
              />
            </div>

            {q && (
              <div id="mobile-search-results" className="mobile-search-results" aria-live="polite">
                {!hasResults ? (
                  <p>Nothing matches “{query}”. Try a make, model or part name.</p>
                ) : (
                  <>
                    {matchingVehicles.map((vehicle) => (
                      <button key={`vehicle-${vehicle.id}`} type="button" onClick={() => go('vehicle-detail', vehicle.id)}>
                        <span>
                          <strong>{vehicle.name}</strong>
                          <small>{vehicle.year} · {Number(vehicle.mileage).toLocaleString()} km</small>
                        </span>
                        <span className="mono">{formatKES(vehicle.price)}</span>
                      </button>
                    ))}
                    {matchingParts.map((part) => (
                      <button key={`part-${part.id}`} type="button" onClick={() => go('part-detail', part.id)}>
                        <span>
                          <strong>{part.name}</strong>
                          <small>{part.brand}</small>
                        </span>
                        <span className="mono">{formatKES(part.promo || part.price)}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}

            <div className="mobile-nav-groups">
              {MOBILE_NAV.map((group) => (
                <section key={group.label} className="mobile-nav-group" aria-labelledby={`mobile-nav-${group.label.toLowerCase()}`}>
                  <div id={`mobile-nav-${group.label.toLowerCase()}`} className="mono mobile-nav-label">{group.label}</div>
                  {group.items.map((item) => {
                    const active = currentView === item.id;
                    return (
                      <a
                        key={item.id}
                        href={pathFor(item.id)}
                        aria-current={active ? 'page' : undefined}
                        onClick={(event) => {
                          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                          event.preventDefault();
                          go(item.id);
                        }}
                        className={active ? 'is-active' : ''}
                      >
                        <span>
                          <strong>{item.label}</strong>
                          <small>{item.note}</small>
                        </span>
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </a>
                    );
                  })}
                </section>
              ))}
            </div>

            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-whatsapp"
            >
              <MessageCircle size={18} aria-hidden="true" />
              <span>
                <strong>Ask on WhatsApp</strong>
                <small>Stock, fitment or directions</small>
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </nav>
        </div>
      )}

      <style>{`
        @media (max-width: 880px) {
          .nav-desktop { display: none !important; }
          .nav-toggle { display: flex !important; }
        }
        @media (max-width: 620px) {
          .search-wrap { display: none; }
        }
        @media (max-width: 720px) and (min-width: 621px) {
          .search-wrap { width: 170px !important; }
        }
        /* Matches the nav's own mobile breakpoint (below): once the nav is
           already hamburger, the info rail must be trimmed too, or it wraps
           to two lines inside a fixed 34px / overflow:hidden row and the
           wrapped lines overlap instead of stacking. Was 620px, leaving a
           260px gap (621-880px) where nothing protected this row. */
        @media (max-width: 880px) {
          .header-rail-location > span:nth-of-type(2),
          .header-rail-location > span:nth-of-type(3),
          .header-rail-meta > a { display: none !important; }
          .header-rail-location,
          .header-rail-meta { gap: 6px !important; }
        }
      `}</style>
    </header>
  );
};

const rowStyle = {
  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
  padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer',
  textAlign: 'left',
};

const thumbStyle = {
  display: 'block', width: '38px', height: '30px', borderRadius: '5px',
  overflow: 'hidden', flexShrink: 0,
};
