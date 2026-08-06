import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { partsForVehicle } from '@shared/lib/compatibility';
import { modelOf, labelForModel } from '@shared/data/mazdaModels';
import { ListingBadge } from '../components/ListingBadge';
import { listingOf, isDealerOwned } from '@shared/lib/format';
import { Img } from '../components/Img';
import { Viewer360 } from '../components/Viewer360';
import { useReveal, revealStyle } from '../lib/useReveal';
import { VehicleCard } from '../components/VehicleCard';
import { SiteIcon } from '../components/SiteIcon';
import {
  ArrowLeft, ArrowUpRight, MessageSquare, CalendarClock, ShieldCheck,
  Fuel, Gauge, Cog, Palette, CarFront, Calendar, Wrench, Tag, FileCheck2,
} from 'lucide-react';

export const VehicleDetailPage = () => {
  const {
    vehicles, parts, compatibility, selectedVehicleId, navigateTo, navigateBackFromDetail, formatKES,
    setIsTestDriveOpen, setTestDriveTargetVehicle, waNumber,
  } = useApp();

  const vehicle = vehicles.find((v) => String(v.id) === String(selectedVehicleId)) || vehicles[0];
  const soldOrReserved = vehicle?.status !== 'Available';
  const [specRef, specShown] = useReveal();
  const [alsoRef, alsoShown] = useReveal();
  const [fitRef, fitShown] = useReveal();

  /* Capped at four: this is a prompt on a vehicle page, not the parts
     catalogue. "All parts for this model" carries anyone who wants the rest. */
  const fittingParts = useMemo(
    () => partsForVehicle(vehicle?.name, parts, compatibility).slice(0, 4),
    [vehicle?.name, parts, compatibility]
  );
  const modelLabel = labelForModel(modelOf(vehicle?.name) ?? '') || vehicle?.name;

  if (!vehicle) {
    return (
      <div style={{ padding: '90px var(--gutter)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-4xl)', color: 'var(--text-dark)', marginBottom: '10px' }}>
          That vehicle is no longer listed
        </h1>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', marginBottom: '20px' }}>
          It may have been sold. The rest of the lot is still available.
        </p>
        <button onClick={() => navigateBackFromDetail('vehicles')} className="btn-primary">Back to all vehicles</button>
      </div>
    );
  }

  const openTestDrive = () => {
    setTestDriveTargetVehicle(vehicle);
    setIsTestDriveOpen(true);
  };

  /* Mirrors the Specification block the yard fills in, field for field —
     engine, make and condition used to live only in the small line under the
     title, where a buyer comparing two units cannot line them up. */
  const specs = [
    { icon: Calendar, label: 'Year', value: vehicle.year },
    { icon: Gauge, label: 'Odometer', value: `${Number(vehicle.mileage).toLocaleString()} km` },
    { icon: Cog, label: 'Transmission', value: vehicle.trans },
    { icon: Fuel, label: 'Fuel', value: vehicle.fuel },
    { icon: Wrench, label: 'Engine', value: vehicle.engine },
    { icon: CarFront, label: 'Body', value: vehicle.body },
    { icon: Palette, label: 'Colour', value: vehicle.color },
    { icon: Tag, label: 'Make', value: vehicle.make },
    { icon: ShieldCheck, label: 'Condition', value: vehicle.condition },
  ].filter((s) => s.value != null && String(s.value).trim() !== '');

  /**
   * The dossier prints what the yard actually recorded against this unit.
   *
   * Rows are dropped when the yard has no value rather than printed empty: a
   * blank next to "Registration" reads as a missing document, when the truth is
   * usually that the car is not registered yet. Anything that would be a real
   * gap — grade, inspection, duty — says so in words instead.
   *
   * Deliberately not here: the import group reference and the cost ledger.
   * Those are the buying position, and the costing module exists to keep them
   * off this surface.
   */
  const dossier = [
    ['Stock number', vehicle.stockId],
    ['Chassis number', vehicle.chassis],
    ['Registration', vehicle.regNumber || 'Not yet registered'],
    ['Auction grade', vehicle.grade],
    ['Odometer', vehicle.odometerVerified ? 'Verified against import documents' : 'Not verified'],
    ['Inspection', vehicle.inspection],
    ['Import duty', vehicle.dutyPaid ? 'Paid — cleared for transfer' : 'Outstanding'],
    ['Port of entry', vehicle.port],
    ['Current stage', vehicle.stage],
    ['Where it is', vehicle.location],
  ].filter(([, value]) => value != null && String(value).trim() !== '');

  // A compact proof summary before the enquiry controls. This is intentionally
  // derived from the listing record rather than presented as a scan: the live
  // database can populate the same fields, while the originals remain the
  // documents a buyer inspects at the yard.
  const dossierPreview = [
    ['Stock reference', vehicle.stockId || 'Not recorded'],
    ['Auction grade', vehicle.grade || 'Not recorded'],
    ['Odometer check', vehicle.odometerVerified ? 'Verified' : 'Not verified'],
    ['Duty status', vehicle.dutyPaid ? 'Paid' : 'Outstanding'],
  ];

  const alsoAvailable = vehicles
    .filter((v) => v.id !== vehicle.id && v.status === 'Available')
    .slice(0, 3);

  const [activeTab, setActiveTab] = React.useState('overview'); // overview | inspection | costing | features

  return (
    <div>
      {/* ───────────── Inspection bay ───────────── */}
      <section style={{ background: 'transparent', color: 'var(--text-body)', borderBottom: '1px solid var(--band-line)', padding: '26px var(--gutter) 56px' }}>
        <button
          onClick={() => navigateBackFromDetail()}
          className="mono link-draw"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center',
            gap: '8px', marginBottom: '26px',
          }}
        >
          <ArrowLeft size={14} /> All vehicles
        </button>

        {/* Identity band */}
        <div style={{ marginBottom: '26px' }}>
          <div style={{ display: 'flex', gap: '7px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <ListingBadge vehicle={vehicle} />
            {isDealerOwned(vehicle) ? (
              <span className="badge badge-available">
                <ShieldCheck size={12} color="var(--primary)" /> {vehicle.inspection}
              </span>
            ) : (
              <span className="badge badge-listing-private">
                {vehicle.inspection} — seller declared
              </span>
            )}
            <span className={`badge badge-${vehicle.status === 'Available' ? 'available' : vehicle.status === 'Reserved' ? 'reserved' : 'sold'}`}>
              {vehicle.status}
            </span>
          </div>

          <div
            className="bay-head"
            style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              gap: '28px', flexWrap: 'wrap',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 600,
                  fontSize: 'var(--text-fluid-2xl)', letterSpacing: '-0.025em',
                  color: 'var(--text-dark)', lineHeight: 1.04,
                }}
              >
                {vehicle.name}
              </h1>
            </div>

            <div className="bay-price" style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 'var(--text-fluid-xl)', fontWeight: 700, color: 'var(--text-dark)', letterSpacing: '-0.02em', lineHeight: 1.05 }}>
                {formatKES(vehicle.price)}
              </div>
              <div className="mono" style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
                {isDealerOwned(vehicle)
                  ? 'Duty paid · logbook transfer included'
                  : 'Duty and transfer terms are set by the seller'}
              </div>
            </div>
          </div>
        </div>

        <div
          className="bay-grid"
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '30px', alignItems: 'start' }}
        >
          <div>
            <Viewer360
              slug={vehicle.slug}
              fallbackImg={vehicle.img}
              gallery={vehicle.images}
              vehicle={vehicle}
              alt={`${vehicle.name} ${vehicle.year}`}
              height={520}
            />
            <p className="mono" style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
              Turntable capture · 360° inspection viewer with hotspots
            </p>

            <div ref={specRef} style={{ ...revealStyle(specShown), marginTop: '30px' }}>
              <div className="mono" style={{ color: 'var(--accent)', marginBottom: '10px' }}>Condition notes</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-fluid-md)', color: 'var(--text-dark)', lineHeight: 1.2, marginBottom: '12px', letterSpacing: '-0.015em' }}>
                What our inspector found
              </h2>
              <p style={{ fontSize: 'var(--text-md)', lineHeight: 1.75, color: 'var(--text-body)', maxWidth: '62ch' }}>
                {vehicle.description}
              </p>

              <div
                style={{
                  marginTop: '20px', padding: '17px 19px', borderRadius: '10px',
                  background: 'var(--primary-light)', border: '1px solid rgba(43, 48, 55,0.14)',
                  display: 'flex', gap: '13px', alignItems: 'flex-start',
                }}
              >
                <SiteIcon icon={ShieldCheck} variant="trust" size={18} />
                <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-body)' }}>
                  Bring a mechanic. We keep the inspection report and import documents on file and hand
                  over copies at the viewing — no appointment needed to see the paperwork.
                </div>
              </div>
            </div>
          </div>

          {/* Details + purchase rail with structured tabs */}
          <div>
            <div
              style={{
                border: '1px solid var(--band-line)', borderRadius: '12px',
                marginBottom: '20px', background: 'var(--bg-card)',
                overflow: 'hidden',
              }}
            >
              {/* Specification Tabs Navigation */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--band-line)', background: 'var(--bg-cream)' }}>
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'inspection', label: 'Inspection & Grade' },
                  { id: 'costing', label: 'Duty & Costing' },
                  { id: 'features', label: 'Features' },
                ].map((tab) => {
                  const isSel = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        flex: 1, padding: '12px 8px', border: 'none', background: isSel ? 'var(--bg-card)' : 'transparent',
                        fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: isSel ? 700 : 500,
                        color: isSel ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer',
                        borderBottom: isSel ? '2px solid var(--primary)' : '2px solid transparent',
                        transition: 'all 200ms ease',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeTab === 'overview' && (
                <SpecBlock title="Specification Overview">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px 18px' }}>
                    {specs.map((s) => {
                      const Icon = s.icon;
                      return (
                        <div key={s.label} className="site-spec-item">
                          <SiteIcon icon={Icon} variant="spec" size={15} />
                          <div style={{ minWidth: 0 }}>
                            <div className="mono" style={{ color: 'var(--text-dim)', fontSize: 'var(--text-2xs)', marginBottom: '3px' }}>{s.label}</div>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)' }}>{s.value}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SpecBlock>
              )}

              {activeTab === 'inspection' && (
                <SpecBlock title="Inspection & Auction Grade">
                  {dossier.slice(3, 8).map(([label, value], i) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                        gap: '16px', padding: '9px 0',
                        borderBottom: i === 4 ? 'none' : '1px solid var(--band-line)',
                      }}
                    >
                      <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--primary)', fontWeight: 600, textAlign: 'right' }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </SpecBlock>
              )}

              {activeTab === 'costing' && (
                <SpecBlock title="Import Duty & Logistics">
                  {dossier.slice(6).map(([label, value], i) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                        gap: '16px', padding: '9px 0',
                        borderBottom: i === dossier.slice(6).length - 1 ? 'none' : '1px solid var(--band-line)',
                      }}
                    >
                      <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-dark)', textAlign: 'right' }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </SpecBlock>
              )}

              {activeTab === 'features' && (
                <SpecBlock title="Key Vehicle Features">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {['Alloy Wheels', 'Leather Seats', 'Keyless Entry', 'Backup Camera', 'Bluetooth Audio', 'Multifunction Steering', 'Air Conditioning', 'ABS & Airbags'].map((feat) => (
                      <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-body)' }}>
                        <ShieldCheck size={14} color="var(--verify)" /> {feat}
                      </div>
                    ))}
                  </div>
                </SpecBlock>
              )}
            </div>


            <section className="dossier-preview" aria-labelledby="dossier-preview-title">
              <div className="dossier-preview-head">
                <span className="dossier-preview-icon" aria-hidden="true">
                  <FileCheck2 size={18} />
                </span>
                <div>
                  <div className="mono">Paperwork preview</div>
                  <h2 id="dossier-preview-title">Four checks before you enquire</h2>
                </div>
              </div>

              <div className="dossier-preview-grid">
                {dossierPreview.map(([label, value]) => (
                  <div key={label}>
                    <span className="mono">{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <p>
                This previews the listing record, not a document scan. Ask to inspect the
                auction sheet, inspection report and clearance originals at the yard.
              </p>
            </section>

            {/* Says plainly whose claim the dossier above is. Without this the
                same layout implies the dealership verified a private sale. */}
            <p
              style={{
                fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-muted)',
                marginBottom: '18px', maxWidth: '52ch',
              }}
            >
              {listingOf(vehicle).blurb}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={openTestDrive}
                className="btn-primary"
                disabled={soldOrReserved}
                style={{ padding: '14px', fontSize: 'var(--text-base)', opacity: soldOrReserved ? 0.5 : 1, cursor: soldOrReserved ? 'not-allowed' : 'pointer' }}
              >
                <CalendarClock size={16} />
                {soldOrReserved ? `This unit is ${vehicle.status.toLowerCase()}` : 'Book a viewing'}
              </button>

              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  `Hello Zoom Imports, I'm interested in the ${vehicle.name} (${vehicle.year}), chassis ${vehicle.chassis}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '14px', fontSize: 'var(--text-base)' }}
              >
                <MessageSquare size={16} /> Ask about this unit
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Parts that fit this model ─────────────
          The compatibility rules only ever ran one way: pick a model on the
          parts page and the shelf narrows. Nobody asked the reverse, so the
          person most likely to buy a CX-5 filter — the one reading the CX-5
          listing — was never shown one. Same index, read backwards. */}
      {fittingParts.length > 0 && (
        <section ref={fitRef} style={{ background: 'transparent', borderBottom: '1px solid var(--band-line)', padding: '52px var(--gutter) 56px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '22px', ...revealStyle(fitShown) }}>
            <div>
              <div className="mono" style={{ color: 'var(--accent)', marginBottom: '10px' }}>Confirmed fitment</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-fluid-md)', color: 'var(--text-dark)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Spares we stock for the {modelLabel}
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '8px', maxWidth: '56ch', lineHeight: 1.6 }}>
                Checked against this model, not just this make. Buy them with the car and
                they travel together.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('parts')}
              className="btn-secondary btn-sm"
            >
              All parts for this model <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="fit-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {fittingParts.map((p, i) => (
              <article
                key={p.id}
                onClick={() => navigateTo('part-detail', p.id)}
                className="fit-card"
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--band-line)',
                  borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column',
                  ...revealStyle(fitShown, i + 1),
                }}
              >
                <div style={{ height: '128px', background: 'var(--bg-card)' }}>
                  <Img src={p.img} alt={p.name} sizes="(max-width: 900px) 50vw, 22vw" style={{ objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '13px 14px 15px', display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                  <div className="mono" style={{ color: 'var(--text-dim)', fontSize: 'var(--text-2xs)' }}>{p.brand}</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--accent)' }}>
                      {formatKES(p.promo || p.price)}
                    </span>
                    <span className={`mono ${p.stock > 0 ? '' : 'is-out'}`} style={{ fontSize: 'var(--text-2xs)', color: p.stock > 0 ? 'var(--verify)' : 'var(--text-dim)' }}>
                      {p.stock > 0 ? `${p.stock} in stock` : 'On order'}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ───────────── Also on the lot ───────────── */}
      {alsoAvailable.length > 0 && (
        <section ref={alsoRef} style={{ background: 'var(--bg-cream)', padding: '64px var(--gutter) 78px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-fluid-md)',
              color: 'var(--text-dark)', marginBottom: '26px', letterSpacing: '-0.02em',
              ...revealStyle(alsoShown),
            }}
          >
            Also on the lot
          </h2>

          <div className="also-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {alsoAvailable.map((v, i) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                formatKES={formatKES}
                onOpen={() => navigateTo('vehicle-detail', v.id)}
                style={revealStyle(alsoShown, i + 1)}
                height={260}
              />
            ))}
          </div>
        </section>
      )}

      <style>{`
        .dossier-preview {
          margin-bottom: 18px;
          padding: 18px;
          border: 1px solid var(--border-medium);
          border-radius: 12px;
          background:
            radial-gradient(95% 130% at 100% 0%, rgba(128, 128, 128, 0.10), transparent 60%),
            var(--primary-light);
        }
        .dossier-preview-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 15px;
        }
        .dossier-preview-icon {
          width: 36px;
          height: 36px;
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-light);
          border-radius: 10px;
          background: var(--bg-card);
          color: var(--primary);
        }
        .dossier-preview-head .mono {
          color: var(--accent);
          font-size: var(--text-xs);
          margin-bottom: 4px;
        }
        .dossier-preview h2 {
          color: var(--text-dark);
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.015em;
        }
        .dossier-preview-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1px;
          overflow: hidden;
          border: 1px solid var(--border-medium);
          border-radius: 9px;
          background: var(--border-medium);
        }
        .dossier-preview-grid > div {
          min-width: 0;
          padding: 11px 12px;
          background: var(--bg-card);
        }
        .dossier-preview-grid span,
        .dossier-preview-grid strong { display: block; }
        .dossier-preview-grid span {
          overflow: hidden;
          color: var(--text-dim);
          font-size: var(--text-2xs);
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dossier-preview-grid strong {
          margin-top: 4px;
          color: var(--text-dark);
          font-size: var(--text-sm);
          line-height: 1.3;
        }
        .dossier-preview > p {
          margin-top: 12px;
          color: var(--text-muted);
          font-size: var(--text-xs);
          line-height: 1.55;
        }

        /* The fitment cards lift on hover the way the parts shelf does — same
           gesture, so the strip reads as the shop, not as an advert. */
        .fit-card { transition: transform 220ms cubic-bezier(0.22,1,0.36,1), box-shadow 220ms ease, border-color 220ms ease; }
        @media (hover: hover) and (pointer: fine) {
          .fit-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--border-medium); }
        }
        @media (prefers-reduced-motion: reduce) { .fit-card { transition: none; } .fit-card:hover { transform: none; } }

        @media (max-width: 1000px) {
          .bay-grid { grid-template-columns: 1fr !important; }
          .detail-split { grid-template-columns: 1fr !important; gap: 34px !important; }
          .also-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .fit-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 620px) {
          .also-grid { grid-template-columns: 1fr !important; }
          .dossier-preview-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Floating CTA Rail on Mobile Viewports */}
      <div className="mobile-cta-rail">
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi Zoom Imports, I am interested in the ${vehicle.name} (${vehicle.year}, ${vehicle.chassis}). Please send details.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px', borderRadius: '8px', background: '#25D366', color: '#fff',
            fontWeight: 700, fontSize: '13px', textDecoration: 'none',
          }}
        >
          <MessageSquare size={16} /> WhatsApp Inquiry
        </a>
        <button
          onClick={openTestDrive}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px', borderRadius: '8px', background: 'var(--accent-fill)', color: 'var(--on-accent)',
            fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer',
          }}
        >
          <CalendarClock size={16} /> Test Drive
        </button>
      </div>
    </div>
  );
};

/**
 * A titled group inside the details card. `divided` draws the hairline that
 * separates the specification from the dossier — one card, but still two
 * distinct kinds of fact.
 */
const SpecBlock = ({ title, divided = false, children }) => (
  <div
    style={{
      padding: '16px 18px',
      borderTop: divided ? '1px solid var(--band-line)' : 'none',
    }}
  >
    <div className="mono" style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', marginBottom: '12px' }}>
      {title}
    </div>
    {children}
  </div>
);

