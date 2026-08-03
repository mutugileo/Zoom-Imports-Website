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
  ArrowRight, ArrowUpRight, ShieldCheck, Gauge, FileCheck2,
  Ship, Quote, ChevronDown, PenLine, Star, CarFront,
} from 'lucide-react';

/* The import journey is a genuine sequence, so it earns its numbering. */
const JOURNEY = [
  { n: '01', label: 'Sourced in Japan', detail: 'Graded unit, report translated', icon: FileCheck2 },
  { n: '02', label: 'Pre-ship inspection', detail: 'JEVIC odometer + structure', icon: ShieldCheck },
  { n: '03', label: 'Mombasa port', detail: 'Duty settled before release', icon: Ship },
  { n: '04', label: 'Mombasa Road yard', detail: 'Yours to drive, same week', icon: CarFront },
];

const FITMENT = COMPATIBILITY_RULES.reduce((acc, rule) => {
  const key = rule.part.trim().toLowerCase();
  if (!acc[key]) acc[key] = rule;
  return acc;
}, {});

export const HomePage = () => {
  const { vehicles, parts, navigateTo, formatKES, addToCart, publishedReviews, setIsReviewOpen, banners } = useApp();

  const featured = vehicles.filter((v) => v.featured && v.status === 'Available');
  const hero = featured[0] || vehicles[0];
  const [lead, ...rest] = featured.length ? featured : vehicles;
  const secondary = rest.slice(0, 2);
  /**
   * Promoted parts lead, then the rest of the counter fills in behind them.
   *
   * The old rule was `promo.length ? promo : parts.slice(0, 4)` — an either/or,
   * so with two promoted parts in stock the section showed exactly two and hid
   * the other seven. Concatenating means the promos still come first but the row
   * always fills, and it degrades on its own if the catalogue is short.
   */
  const showcaseParts = [
    ...parts.filter((p) => p.promo),
    ...parts.filter((p) => !p.promo),
  ].slice(0, 8);

  const [journeyRef, journeyShown] = useReveal();
  const [fleetRef, fleetShown] = useReveal();
  const [partsRef, partsShown] = useReveal();
  const [quoteRef, quoteShown] = useReveal();

  // Depth wrappers. The hero is left flat — it is the first paint and already
  // carries the measured scrim treatment.
  const journeyDepth = useDepthLayer();
  const fleetDepth = useDepthLayer();
  const partsDepth = useDepthLayer();
  const quoteDepth = useDepthLayer();

  const availableCount = vehicles.filter((v) => v.status === 'Available').length;
  const featuredReviews = publishedReviews.slice(0, 2);

  return (
    <div>
      {/* ───────────── Hero: a documented car, not a stock photo ───────────── */}
      <section
        style={{
          position: 'relative',
          background: 'var(--ink)',
          color: 'var(--text-on-ink)',
          minHeight: 'min(86vh, 760px)',
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          <Img
            src={hero?.img}
            alt={`${hero?.name} ${hero?.year} on the Zoom Imports lot`}
            loading="eager"
            sizes="100vw"
            style={{ objectPosition: 'center 45%' }}
          />
          {/* Two scrims rather than one. The vertical grade sets the mood; the
              left-anchored one gives the copy a guaranteed dark ground so the
              text stays legible whichever vehicle is featured, while the right
              of the frame stays open for the car. Measured to WCAG AA against
              every image that can appear here. */}
          <div className="hero-scrim-v" aria-hidden="true" />
          <div className="hero-scrim-h" aria-hidden="true" />
        </div>

        <div
          className="hero-inner"
          style={{
            position: 'relative',
            width: '100%',
            padding: '120px var(--gutter) 56px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.85fr)',
            gap: '40px',
            alignItems: 'end',
          }}
        >
          <div>
            {/* Cream, not accent orange: at 11px the accent measured 1.15:1
                over a bright photo. The brand colour stays on the dot. */}
            <div
              className="mono"
              style={{
                color: '#f4e3c6', marginBottom: '16px', display: 'flex',
                alignItems: 'center', gap: '10px',
                textShadow: '0 1px 10px rgba(22,40,58,0.75)',
              }}
            >
              <span
                style={{
                  width: '6px', height: '6px', borderRadius: '999px',
                  background: 'var(--verify)', display: 'inline-block',
                }}
              />
              {availableCount} inspected units on the lot
            </div>

            <h1
              className="hero-title"
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                fontSize: 'var(--text-fluid-3xl)',
                lineHeight: 1.04,
                letterSpacing: '-0.025em',
                color: '#fff',
                marginBottom: '18px',
                maxWidth: '14ch',
                textShadow: '0 2px 22px rgba(22,40,58,0.7)',
              }}
            >
              Every import,
              <br />
              <span style={{ fontStyle: 'italic', color: 'var(--accent-light)' }}>documented</span> before
              it&rsquo;s driven.
            </h1>

            <p
              style={{
                fontSize: 'var(--text-fluid-sm)',
                lineHeight: 1.6,
                color: 'rgba(238,242,247,0.94)',
                maxWidth: '46ch',
                marginBottom: '26px',
                textShadow: '0 1px 14px rgba(22,40,58,0.7)',
              }}
            >
              Inspection report, chassis number, verified odometer and duty receipt — on the table
              before you put down a shilling. Vehicles and genuine spares, Mombasa Road.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => navigateTo('vehicles')} className="btn-primary" style={{ padding: '14px 26px', fontSize: 'var(--text-base)' }}>
                Browse the lot <ArrowRight size={16} />
              </button>
              <button onClick={() => navigateTo('parts')} className="btn-ghost" style={{ padding: '14px 26px', fontSize: 'var(--text-base)' }}>
                Find a spare part
              </button>
            </div>
          </div>

          {/* Dossier card — the signature device, introduced on the hero */}
          {hero && (
            <GlassCard className="hero-dossier" style={{ padding: '22px 24px' }}>
              <div className="mono" style={{ color: 'var(--accent-light)', marginBottom: '14px' }}>
                On the lot now
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 600, color: '#fff', lineHeight: 1.15 }}>
                {hero.name}
              </div>
              <div className="mono" style={{ color: 'rgba(238,242,247,0.78)', marginTop: '4px', marginBottom: '18px' }}>
                {hero.year} · {hero.trans} · {hero.engine}
              </div>

              <DossierRow label="Chassis" value={hero.chassis} />
              <DossierRow label="Auction grade" value={hero.grade} />
              <DossierRow label="Odometer" value={`${Number(hero.mileage).toLocaleString()} km · verified`} />
              <DossierRow label="Inspection" value={hero.inspection} last />

              <button
                onClick={() => navigateTo('vehicle-detail', hero.id)}
                className="btn-primary"
                style={{ width: '100%', marginTop: '18px', padding: '13px' }}
              >
                Open full dossier <ArrowUpRight size={15} />
              </button>
            </GlassCard>
          )}
        </div>

        <div
          aria-hidden="true"
          className="scroll-cue mono"
          style={{
            position: 'absolute', left: 'var(--gutter)', bottom: '18px',
            color: 'rgba(238,242,247,0.42)', display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <ChevronDown size={14} /> Scroll
        </div>
      </section>

      {/* ───────────── Yard promotions ─────────────
          Banners the counter publishes on the admin portal's Site Content
          screen. That screen has always saved them into a store the website
          never read, so a banner added at the yard appeared nowhere.

          Renders nothing at all when there are none, which is the default —
          the homepage should not carry an empty promotional shelf waiting to
          be filled. */}
      {banners.length > 0 && (
        <section style={{ background: 'transparent', padding: '10px var(--gutter) 60px' }}>
          <div className="mono" style={{ color: 'var(--accent)', marginBottom: '16px' }}>On now</div>
          <div className="banner-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(banners.length, 3)}, 1fr)`, gap: '18px' }}>
            {banners.map((b) => {
              const inner = (
                <>
                  <div className="zoom-frame" style={{ position: 'absolute', inset: 0 }}>
                    <Img src={b.img} alt={b.title} sizes="(max-width: 900px) 100vw, 32vw" />
                  </div>
                  {/* Same measured scrim the vehicle card uses: a banner image
                      is uploaded by staff, so the title cannot rely on it
                      being dark where the words sit. */}
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
              /* A banner without a link is a picture, not a control — it must
                 not be focusable or announced as a link. */
              return b.link
                ? <a key={b.id} className="hover-card" href={b.link} style={style}>{inner}</a>
                : <div key={b.id} style={style}>{inner}</div>;
            })}
          </div>
        </section>
      )}

      {/* ───────────── Import journey: a real sequence ───────────── */}
      <section
        ref={journeyRef}
        style={{ background: 'transparent', color: 'var(--text-body)', padding: '0 var(--gutter)', borderBottom: '1px solid var(--band-line)' }}
      >
        <div className="depth-layer" ref={journeyDepth}>
        <div
          className="journey-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderLeft: '1px solid var(--band-line)' }}
        >
          {JOURNEY.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                style={{
                  padding: '34px 26px 38px',
                  borderRight: '1px solid var(--band-line)',
                  ...revealStyle(journeyShown, i),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                  <SiteIcon icon={Icon} variant="journey" size={19} />
                  <span className="mono" style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)' }}>{step.n}</span>
                </div>
                <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '5px' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {step.detail}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </section>

      {/* ───────────── Fleet: asymmetric, not a uniform grid ───────────── */}
      <section ref={fleetRef} style={{ background: 'transparent', padding: '84px var(--gutter)' }}>
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
      <section ref={partsRef} style={{ background: 'transparent', padding: '78px var(--gutter)' }}>
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

        {/* Category chips — a different structural device from the cards above */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '26px', ...revealStyle(partsShown, 1) }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => navigateTo('parts')}
              className="mono"
              style={{
                background: '#fff', border: '1px solid var(--border-light)',
                borderRadius: '999px', padding: '8px 14px', cursor: 'pointer',
                color: 'var(--text-body)', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '999px', background: c.color }} />
              {c.name}
            </button>
          ))}
        </div>

        <div className="parts-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
          {showcaseParts.map((p, i) => (
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
          ))}
        </div>
        </div>
      </section>

      {/* ───────────── One voice, given room ───────────── */}
      <section
        ref={quoteRef}
        style={{
          background: 'transparent', color: 'var(--text-body)',
          padding: '40px var(--gutter)',
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
          .journey-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .parts-row { grid-template-columns: repeat(2, 1fr) !important; }
          .quote-pair { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 900px) {
          .banner-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .journey-grid { grid-template-columns: 1fr !important; }
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

const FeatureCard = ({ vehicle, vehicles = [], formatKES, onOpen, style }) => (
  <a
    className="hover-card"
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
