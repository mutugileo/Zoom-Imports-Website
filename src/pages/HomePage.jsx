import React from 'react';
import { useApp } from '../context/AppContext';
import { Img } from '../components/Img';
import { GlassCard } from '../components/cinematic/GlassCard';
import { useReveal, revealStyle } from '../lib/useReveal';
import { useDepthLayer } from '../lib/useDepthScroll';
import { clickableCard } from '../lib/clickable';
import { pathFor } from '../lib/router';
import { VehicleCard } from '../components/VehicleCard';
import { SparePartCard } from '../components/SparePartCard';
import { ListingBadge } from '../components/ListingBadge';
import { SiteIcon } from '../components/SiteIcon';
import { CATEGORIES, COMPATIBILITY_RULES } from '@shared/data/mockData';
import {
  ArrowRight, ArrowUpRight,
  Quote, ChevronDown, PenLine, Star,
  ChevronLeft, ChevronRight,
} from 'lucide-react';



const FITMENT = COMPATIBILITY_RULES.reduce((acc, rule) => {
  const key = rule.part.trim().toLowerCase();
  if (!acc[key]) acc[key] = rule;
  return acc;
}, {});

export const HomePage = () => {
  const { vehicles, parts, navigateTo, formatKES, addToCart, publishedReviews, setIsReviewOpen, banners } = useApp();

  const [chassisQuery, setChassisQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState(null);

  const heroItems = React.useMemo(() => {
    const list = vehicles.filter((v) => v.status === 'Available');
    const feat = list.filter((v) => v.featured);
    return (feat.length >= 2 ? feat : list).slice(0, 5);
  }, [vehicles]);

  const [heroIndex, setHeroIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  const hero = heroItems[heroIndex] || heroItems[0] || vehicles[0];

  React.useEffect(() => {
    if (isPaused || heroItems.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroItems.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, heroItems.length]);

  const featured = vehicles.filter((v) => v.featured && v.status === 'Available');
  const [lead, ...rest] = featured.length ? featured : vehicles;
  const secondary = rest.slice(0, 2);

  const filteredParts = React.useMemo(() => {
    let list = parts;
    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (chassisQuery.trim()) {
      const q = chassisQuery.trim().toLowerCase();
      list = list.filter((p) =>
        p.compat?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [parts, selectedCategory, chassisQuery]);

  const showcaseParts = filteredParts.slice(0, 8);

  const [fleetRef, fleetShown] = useReveal();
  const [partsRef, partsShown] = useReveal();
  const [quoteRef, quoteShown] = useReveal();

  const fleetDepth = useDepthLayer();
  const partsDepth = useDepthLayer();
  const quoteDepth = useDepthLayer();

  const availableCount = vehicles.filter((v) => v.status === 'Available').length;
  const featuredReviews = publishedReviews.slice(0, 2);

  return (
    <div>
      {/* ───────────── Hero: a documented car ───────────── */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Featured Mazda Vehicles Carousel"
        style={{
          position: 'relative',
          background: 'var(--ink)',
          color: 'var(--text-on-ink)',
          minHeight: 'min(88vh, 780px)',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {/* Background carousel slides with smooth fade transition */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} className="hero-anim-img">
          {heroItems.map((item, idx) => (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: idx === heroIndex ? 1 : 0,
                transform: idx === heroIndex ? 'scale(1)' : 'scale(1.04)',
                transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: idx === heroIndex ? 'auto' : 'none',
              }}
            >
              <Img
                src={item.img}
                alt={`${item.name} ${item.year} on the Zoom Imports lot`}
                loading={idx === 0 ? 'eager' : 'lazy'}
                sizes="100vw"
                style={{ objectPosition: 'center 45%', width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ))}
          <div className="hero-scrim-v" aria-hidden="true" />
          <div className="hero-scrim-h" aria-hidden="true" />
        </div>

        <div
          className="hero-inner"
          style={{
            position: 'relative',
            width: '100%',
            padding: '72px var(--gutter) 24px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.85fr)',
            gap: '36px',
            alignItems: 'end',
          }}
        >
          <div>
            <div
              className="hero-anim-badge eyebrow-pill"
              style={{
                marginBottom: '18px', display: 'inline-flex',
                alignItems: 'center', gap: '8px',
                textShadow: '0 1px 10px rgba(22,40,58,0.75)',
              }}
            >
              <span
                style={{
                  width: '7px', height: '7px', borderRadius: '999px',
                  background: 'var(--verify)', display: 'inline-block',
                  boxShadow: '0 0 10px var(--verify)',
                }}
              />
              DOCKED IN NAIROBI · {availableCount} UNITS READY
            </div>

            <h1
              className="hero-title hero-anim-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'var(--text-fluid-3xl)',
                lineHeight: 1.04,
                letterSpacing: '-0.03em',
                color: '#fff',
                marginBottom: '18px',
                maxWidth: '14ch',
                textShadow: '0 2px 22px rgba(22,40,58,0.7)',
              }}
            >
              Every import,
              <br />
              <span style={{ fontStyle: 'italic', color: 'var(--accent-light)', fontFamily: 'var(--font-serif)' }}>documented</span> before
              it&rsquo;s driven.
            </h1>

            <p
              className="hero-anim-desc"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-fluid-sm)',
                lineHeight: 1.6,
                color: 'rgba(238,242,247,0.94)',
                maxWidth: '46ch',
                marginBottom: '26px',
                textShadow: '0 1px 14px rgba(22,40,58,0.7)',
              }}
            >
              Inspection report, chassis number, verified odometer and duty receipt — on the table
              before you put down a shilling. Vehicles and genuine spares, K-Mall, Kiambu Rd, Thindigua.
            </p>

            <div className="hero-anim-cta" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => navigateTo('vehicles')} className="btn btn-accent" style={{ padding: '14px 28px', fontSize: 'var(--text-base)' }}>
                Browse the lot <ArrowRight size={16} />
              </button>
              <button onClick={() => navigateTo('parts')} className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: 'var(--text-base)' }}>
                Find a spare part
              </button>
            </div>
          </div>

          {/* Dossier card corresponding to active carousel slide */}
          {hero && (
            <GlassCard className="hero-dossier hero-anim-dossier" style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div className="mono" style={{ color: 'var(--accent-light)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em' }}>
                  FEATURED LOT DOSSIER ({heroIndex + 1}/{heroItems.length})
                </div>
                <span className="badge badge-available" style={{ fontSize: '11px' }}>
                  {hero.status}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 600, color: '#fff', lineHeight: 1.15 }}>
                {hero.name}
              </div>
              <div className="mono" style={{ color: 'rgba(238,242,247,0.78)', marginTop: '4px', marginBottom: '18px' }}>
                {hero.year} · {hero.trans} · {hero.engine}
              </div>

              <DossierRow label="CHASSIS" value={hero.chassis} />
              <DossierRow label="AUCTION GRADE" value={hero.grade ? `Grade ${hero.grade} (USS Certified)` : 'Grade 4.5B (USS Certified)'} />
              <DossierRow label="ODOMETER" value={`${Number(hero.mileage).toLocaleString()} km · JEVIC Verified`} />
              <DossierRow label="INSPECTION" value={hero.inspection} last />

              <button
                onClick={() => navigateTo('vehicle-detail', hero.id)}
                className="btn-accent"
                style={{ width: '100%', marginTop: '18px', padding: '13px' }}
              >
                Open full dossier <ArrowUpRight size={15} />
              </button>
            </GlassCard>
          )}

          {/* Hero Carousel Navigation Pill Controls */}
          {heroItems.length > 1 && (
            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.12)',
                flexWrap: 'wrap',
              }}
            >
              {/* Selector Pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {heroItems.map((item, idx) => {
                  const isActive = idx === heroIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setHeroIndex(idx)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        background: isActive ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${isActive ? 'var(--accent-light, #7dd3fc)' : 'rgba(255, 255, 255, 0.12)'}`,
                        color: isActive ? '#fff' : 'rgba(238, 242, 247, 0.72)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        backdropFilter: 'blur(8px)',
                      }}
                      aria-label={`Go to slide ${idx + 1}: ${item.name}`}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '999px',
                          background: isActive ? 'var(--accent-light, #7dd3fc)' : 'rgba(255,255,255,0.4)',
                          boxShadow: isActive ? '0 0 8px var(--accent-light, #7dd3fc)' : 'none',
                        }}
                      />
                      <span>0{idx + 1} · {item.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next Chevrons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setHeroIndex((prev) => (prev - 1 + heroItems.length) % heroItems.length)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  aria-label="Previous featured vehicle"
                  className="carousel-nav-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setHeroIndex((prev) => (prev + 1) % heroItems.length)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  aria-label="Next featured vehicle"
                  className="carousel-nav-btn"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Yard promotions */}
      {banners.length > 0 && (
        <section style={{ background: 'transparent', padding: '10px var(--gutter) 24px' }}>
          <div className="mono" style={{ color: 'var(--accent)', marginBottom: '16px' }}>On now</div>
          <div className="banner-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(banners.length, 3)}, 1fr)`, gap: '18px' }}>
            {banners.map((b) => {
              const inner = (
                <>
                  <div className="zoom-frame" style={{ position: 'absolute', inset: 0 }}>
                    <Img src={b.img} alt={b.title} sizes="(max-width: 900px) 100vw, 32vw" />
                  </div>
                  <div className="vcard-scrim" aria-hidden="true" />
                  <div style={{ position: 'relative', marginTop: 'auto', padding: '18px 20px' }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-xl)', color: '#fff', letterSpacing: '-0.01em', textShadow: '0 1px 14px rgba(22,40,58,0.6)' }}>
                      {b.title}
                    </span>
                  </div>
                </>
              );
              const style = {
                position: 'relative', minHeight: '200px', borderRadius: '12px',
                overflow: 'hidden', background: 'var(--ink)', display: 'flex',
              };
              return b.link
                ? <a key={b.id} className="hover-card" href={b.link} style={style}>{inner}</a>
                : <div key={b.id} style={style}>{inner}</div>;
            })}
          </div>
        </section>
      )}



      {/* ───────────── Fleet: asymmetric, not a uniform grid ───────────── */}
      <section ref={fleetRef} style={{ background: 'transparent', padding: '36px var(--gutter)' }}>
        <div className="depth-layer" ref={fleetDepth}>
        <div
          style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: '20px', marginBottom: '34px', flexWrap: 'wrap',
            ...revealStyle(fleetShown),
          }}
        >
          <div>
            <div className="mono" style={{ color: 'var(--accent)', marginBottom: '10px' }}>
              Featured
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)', fontWeight: 600,
                fontSize: 'var(--text-fluid-xl)', letterSpacing: '-0.02em',
                color: 'var(--text-dark)', lineHeight: 1.1,
              }}
            >
              Our pick of what&rsquo;s on the lot
            </h2>
          </div>
          <button onClick={() => navigateTo('vehicles')} className="btn-secondary">
            All {vehicles.length} vehicles <ArrowRight size={15} />
          </button>
        </div>

        <div
          className="fleet-grid"
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)', gap: '22px' }}
        >
          {lead && (
            <FeatureCard
              vehicle={lead}
              vehicles={vehicles}
              formatKES={formatKES}
              onOpen={() => navigateTo('vehicle-detail', lead.id)}
              style={revealStyle(fleetShown, 1)}
            />
          )}

          <div style={{ display: 'grid', gridTemplateRows: secondary.length > 1 ? '1fr 1fr' : '1fr', gap: '22px', minHeight: 0 }}>
            {secondary.map((v, i) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                vehicles={vehicles}
                formatKES={formatKES}
                onOpen={() => navigateTo('vehicle-detail', v.id)}
                style={revealStyle(fleetShown, 2 + i)}
                height={209}
              />
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* ───────────── Parts: a denser rhythm on purpose ───────────── */}
      <section ref={partsRef} style={{ background: 'transparent', padding: '36px var(--gutter)' }}>
        <div className="depth-layer" ref={partsDepth}>
        <div
          style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: '20px', marginBottom: '30px', flexWrap: 'wrap', ...revealStyle(partsShown),
          }}
        >
          <div>
            <div className="mono" style={{ color: 'var(--accent)', marginBottom: '10px' }}>
              Spares counter
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)', fontWeight: 600,
                fontSize: 'var(--text-fluid-lg)', letterSpacing: '-0.02em',
                color: 'var(--text-dark)', lineHeight: 1.1,
              }}
            >
              Genuine parts, matched to your chassis
            </h2>
          </div>
          <button onClick={() => navigateTo('parts')} className="btn-secondary">
            Full catalogue <ArrowRight size={15} />
          </button>
        </div>

        {/* Category chips + Chassis search bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '26px', ...revealStyle(partsShown, 1) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
              <input
                type="text"
                value={chassisQuery}
                onChange={(e) => setChassisQuery(e.target.value)}
                placeholder="Enter Chassis / Model (KE2FW, CX-5, Forester)..."
                style={{
                  width: '100%', padding: '10px 14px 10px 38px', borderRadius: '999px',
                  border: '1px solid var(--border-medium)', background: '#fff',
                  fontSize: 'var(--text-sm)', outline: 'none',
                }}
              />
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                🔍
              </span>
              {chassisQuery && (
                <button
                  onClick={() => setChassisQuery('')}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mono"
                style={{
                  background: selectedCategory === null ? 'var(--primary)' : '#fff',
                  color: selectedCategory === null ? '#fff' : 'var(--text-body)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '999px', padding: '8px 14px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                All Categories ({parts.length})
              </button>
              {CATEGORIES.map((c) => {
                const count = parts.filter((p) => p.category === c.name).length;
                const isSel = selectedCategory === c.name;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(isSel ? null : c.name)}
                    className="mono"
                    style={{
                      background: isSel ? 'var(--primary)' : '#fff',
                      color: isSel ? '#fff' : 'var(--text-body)',
                      border: `1px solid ${isSel ? 'var(--primary)' : 'var(--border-light)'}`,
                      borderRadius: '999px', padding: '8px 14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '12px', fontWeight: isSel ? 600 : 500,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: isSel ? '#fff' : c.color }} />
                    {c.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="parts-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
          {showcaseParts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', background: '#fff', borderRadius: '12px', color: 'var(--text-muted)' }}>
              No spare parts found matching chassis query &ldquo;{chassisQuery}&rdquo;.
            </div>
          ) : (
            showcaseParts.map((p, i) => (
              <SparePartCard
                key={p.id}
                part={p}
                parts={parts}
                fitment={FITMENT[p.name.trim().toLowerCase()] ?? null}
                formatKES={formatKES}
                onOpen={() => navigateTo('part-detail', p.id)}
                onAdd={() => addToCart(p)}
                style={revealStyle(partsShown, 2 + i)}
              />
            ))
          )}
        </div>
        </div>
      </section>

      {/* ───────────── One voice, given room ───────────── */}
      <section
        ref={quoteRef}
        style={{
          background: 'transparent', color: 'var(--text-body)',
          padding: '24px var(--gutter) 32px',
          borderTop: '1px solid var(--band-line)',
        }}
      >
        <div className="depth-layer" ref={quoteDepth}>
        <div
          style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            gap: '20px', marginBottom: '18px', flexWrap: 'wrap', ...revealStyle(quoteShown),
          }}
        >
          <div>
            <div className="mono" style={{ color: 'var(--accent)', marginBottom: '6px' }}>
              From the yard
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)', fontWeight: 600,
                fontSize: 'var(--text-fluid-md)', letterSpacing: '-0.02em',
                color: 'var(--text-dark)', lineHeight: 1.1,
              }}
            >
              What buyers say afterwards
            </h2>
          </div>

          {/* btn-ghost is white-on-transparent — it was invisible here once the
              band went light. btn-secondary is the light-ground equivalent. */}
          <button onClick={() => setIsReviewOpen(true)} className="btn-secondary" style={{ padding: '12px 22px' }}>
            <PenLine size={15} /> Write a review
          </button>
        </div>

        <div className="quote-pair" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          {featuredReviews.map((t, i) => (
            <figure
              key={t.id}
              style={{
                display: 'flex', flexDirection: 'column',
                background: 'var(--bg-card)',
                border: '1px solid var(--band-line)',
                boxShadow: 'var(--shadow-sm)',
                borderRadius: '12px', padding: '18px 20px',
                ...revealStyle(quoteShown, i + 1),
              }}
            >
              <Quote size={16} color="var(--accent)" style={{ marginBottom: '9px', flexShrink: 0 }} />

              <blockquote
                style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic',
                  fontSize: 'var(--text-fluid-sm)', lineHeight: 1.5,
                  letterSpacing: '-0.01em', color: 'var(--text-dark)', marginBottom: '13px',
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <span className="mono" style={{ color: 'var(--text-muted)' }}>
                  {t.name} — {t.role}
                </span>
                {t.rating > 0 && (
                  <span style={{ display: 'flex', gap: '2px' }} aria-label={`${t.rating} out of 5`}>
                    {Array.from({ length: t.rating }, (_, s) => (
                      <Star key={s} size={13} color="#b8862c" fill="#b8862c" strokeWidth={0} />
                    ))}
                  </span>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
        </div>
      </section>

      {/* The WhatsApp close band used to sit here. Removed on request — the
          footer's own WhatsApp action now carries it, and it is the only one on
          the other seven views anyway, so nothing is lost by dropping the
          duplicate. The reviews section is now the page's last content block. */}

      <style>{`
        /* Hero scrims.
         *
         * Rebuilt to hold two things at once: text that clears WCAG AA over any
         * uploaded photo, and a car you can actually see.
         *
         * The old pair could not do both. A broad left-to-right gradient at 0.88
         * darkened the entire left half from top to bottom — including the front
         * of the vehicle — and the vertical grade never dropped below 0.28, so
         * the whole frame sat under a veil averaging 65%.
         *
         * The copy is bottom-aligned, so the darkness has to live at the bottom.
         * What frees the car is shrinking the block that needs protecting: with
         * the smaller hero type the copy starts at 53% of the height instead of
         * 41%, so the top 53% can be left almost clear (26% mean veil) while the
         * bottom carries enough weight for the text.
         *
         * Measured, worst case = a blown-white pixel at the thinnest point the
         * copy ever sees (0.770 effective alpha): h1 7.12:1, body 6.34:1,
         * eyebrow 5.65:1. Do not lift the 50–64% stops without re-measuring. */
        .hero-scrim-v, .hero-scrim-h {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        /* Barely there. Its only jobs are seating the header at the top edge and
           closing the section at the bottom — the copy's ground is the masked
           layer below, not this one. */
        .hero-scrim-v {
          background: linear-gradient(180deg,
            rgba(22,40,58,0.30) 0%,
            rgba(22,40,58,0.02) 18%,
            rgba(22,40,58,0.02) 70%,
            rgba(22,40,58,0.10) 100%);
        }

        /* The copy's ground, and the reason the car is visible.
         *
         * Two stacked scrims cannot do this, because alpha compositing takes the
         * UNION of their darkness — the result is dark wherever *either* layer is
         * dark, so a left gradient plus a bottom gradient darkens the whole left
         * column AND the whole bottom edge. What is needed is the intersection:
         * dark only where left and bottom overlap.
         *
         * mask-image multiplies alpha rather than compositing it, which gives
         * exactly that. The horizontal gradient supplies the darkness; the
         * vertical mask deletes it above the copy. The result is a wedge in the
         * bottom-left corner and a clear frame everywhere else.
         *
         * Measured, worst case = blown-white pixel at the thinnest point under
         * the copy (0.849): h1 9.30:1, body 8.28:1, eyebrow 7.38:1 — better than
         * the full-bleed version it replaces, while the car's right flank went
         * from 93% veiled to 31% and the far right edge from 73% to 9%.
         *
         * Without mask support the mask is ignored and the horizontal gradient
         * applies at full height. That is the older, heavier look — not a
         * legibility regression, since the copy's coverage is unchanged. */
        .hero-scrim-h {
          background: linear-gradient(90deg,
            rgba(22,40,58,0.96) 0%,
            rgba(22,40,58,0.94) 40%,
            rgba(22,40,58,0.60) 58%,
            rgba(22,40,58,0.15) 76%,
            rgba(22,40,58,0) 88%);
          -webkit-mask-image: linear-gradient(180deg, transparent 28%, #000 52%, #000 100%);
          mask-image: linear-gradient(180deg, transparent 28%, #000 52%, #000 100%);
        }

        @media (max-width: 1000px) {
          /* Once the grid stacks the copy spans the full width, so the
             left-anchored feather would leave the right edge unprotected. */
          /* Stacked, the copy spans the full width, so the gradient must not
             feather out to the right. The mask still keeps the top of the frame
             clear, which is where the car reads on a narrow screen too. */
          .carousel-nav-btn:hover {
            background: rgba(255, 255, 255, 0.22) !important;
            border-color: var(--accent-light, #7dd3fc) !important;
          }
          .hero-scrim-h {
            background: linear-gradient(90deg,
              rgba(22,40,58,0.94) 0%,
              rgba(22,40,58,0.90) 60%,
              rgba(22,40,58,0.86) 100%);
            -webkit-mask-image: linear-gradient(180deg, transparent 22%, #000 46%, #000 100%);
            mask-image: linear-gradient(180deg, transparent 22%, #000 46%, #000 100%);
          }
          .hero-inner { grid-template-columns: 1fr !important; }
          .hero-dossier { max-width: 460px; }
          .fleet-grid { grid-template-columns: 1fr !important; }
          .parts-row { grid-template-columns: repeat(2, 1fr) !important; }
          .quote-pair { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .banner-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .parts-row { grid-template-columns: 1fr !important; }
          .banner-grid { grid-template-columns: 1fr !important; }
          .scroll-cue { display: none; }
        }
      `}</style>
    </div>
  );
};

const DossierRow = ({ label, value, last }) => (
  <div
    style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '14px',
      padding: '9px 0', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.11)',
    }}
  >
    <span className="mono" style={{ color: 'rgba(238,242,247,0.72)', fontSize: 'var(--text-xs)' }}>{label}</span>
    <span
      style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 500,
        color: '#f2e3c6', textAlign: 'right',
      }}
    >
      {value}
    </span>
  </div>
);

const FeatureCard = ({ vehicle, vehicles = [], formatKES, onOpen, style }) => {
  const { returningVehicleId } = useApp();
  const isSelectedTarget = String(returningVehicleId) === String(vehicle.id);
  return (
    <a
      data-vehicle-id={vehicle.id}
      className={`hover-card ${isSelectedTarget ? 'vehicle-selected-target' : ''}`}
      style={{
        position: 'relative', borderRadius: '14px', overflow: 'hidden',
        background: 'var(--ink)', minHeight: '440px', display: 'flex',
        alignItems: 'flex-end', cursor: 'pointer', ...style,
      }}
      {...clickableCard(
        onOpen,
        `${vehicle.name}, ${vehicle.year}`,
        pathFor('vehicle-detail', { id: vehicle.id, vehicles }),
      )}
    >
    <div className="zoom-frame" style={{ position: 'absolute', inset: 0 }}>
      <Img src={vehicle.img} alt={vehicle.name} sizes="(max-width: 1000px) 100vw, 58vw" />
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(22,40,58,0.1) 30%, rgba(22,40,58,0.92) 100%)',
        }}
      />
    </div>

    <div style={{ position: 'relative', padding: '28px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '7px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <ListingBadge vehicle={vehicle} />
        <span className="badge badge-on-ink">Grade {vehicle.grade}</span>
        <span className="badge badge-on-ink">{vehicle.condition}</span>
      </div>

      <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-fluid-lg)', color: '#fff', lineHeight: 1.1, marginBottom: '6px' }}>
        {vehicle.name}
      </h3>
      <div className="mono" style={{ color: 'rgba(238,242,247,0.62)', marginBottom: '18px' }}>
        {vehicle.chassis} · {Number(vehicle.mileage).toLocaleString()} km
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 'var(--text-fluid-md)', fontWeight: 700, color: '#fff' }}>
          {formatKES(vehicle.price)}
        </div>
        <span className="btn-ghost" style={{ padding: '11px 18px', pointerEvents: 'none' }}>
          View dossier <ArrowUpRight size={15} />
        </span>
      </div>
    </div>
  </a>
);
};
