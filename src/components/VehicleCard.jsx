import React from 'react';
import { useApp } from '../context/AppContext';
import { Img } from './Img';
import { clickableCard } from '../lib/clickable';
import { ListingBadge } from './ListingBadge';
import { pathFor } from '../lib/router';
import { ArrowUpRight, Calendar, Gauge, ShieldCheck, Fuel, Eye } from 'lucide-react';

/**
 * Vehicle card — photo plate with spec icons, status badge, and hover overlay action.
 */
export const VehicleCard = ({ vehicle, vehicles = [], formatKES, onOpen, style, height = 320 }) => {
  const { returningVehicleId } = useApp();
  const isSelectedTarget = String(returningVehicleId) === String(vehicle.id);
  const statusTone =
    vehicle.status === 'Available' ? 'available' :
    vehicle.status === 'Reserved' ? 'reserved' : 'sold';

  return (
    <a
      data-vehicle-id={vehicle.id}
      className={`hover-card vcard ${isSelectedTarget ? 'vehicle-selected-target' : ''}`}
      {...clickableCard(
        onOpen,
        `${vehicle.name}, ${vehicle.year}, ${formatKES(vehicle.price)}`,
        pathFor('vehicle-detail', { id: vehicle.id, vehicles }),
      )}
      style={{
        position: 'relative',
        minHeight: `${height}px`,
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--ink)',
        display: 'flex',
        boxShadow: '0 18px 40px -15px rgba(13, 25, 38, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ...style,
      }}
    >
      <div className="zoom-frame" style={{ position: 'absolute', inset: 0, transition: 'transform 500ms ease' }}>
        <Img src={vehicle.img} alt={vehicle.name} sizes="(max-width: 900px) 100vw, 32vw" />
      </div>

      <div className="vcard-scrim" aria-hidden="true" />

      {/* Details panel */}
      <div className="vcard-panel" style={{ borderRadius: '12px', background: 'rgba(13, 25, 38, 0.82)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        <div className="mono vcard-panel-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
          <Calendar size={12} color="var(--accent-light)" />
          {vehicle.year} · <ShieldCheck size={12} color="var(--verify)" /> grade {vehicle.grade}
        </div>

        <h3 className="vcard-name" style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)' }}>{vehicle.name}</h3>

        <div className="mono vcard-chassis" style={{ fontSize: '10px', opacity: 0.85 }}>{vehicle.chassis}</div>

        <div className="vcard-rule" />

        <div className="mono vcard-specs" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
          <Gauge size={12} color="rgba(255,255,255,0.75)" />
          {Number(vehicle.mileage).toLocaleString()} km
          <span className="vcard-sep">/</span>
          {vehicle.fuel || 'Petrol'}
        </div>
      </div>

      {/* Status */}
      <span className={`badge badge-${statusTone} vcard-status`} style={{ borderRadius: '9999px', padding: '5px 12px', backdropFilter: 'blur(6px)' }}>
        {vehicle.status}
      </span>

      {/* Price and foot */}
      <div className="vcard-foot">
        <span className="vcard-foot-stack">
          <span className="vcard-price" style={{ fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{formatKES(vehicle.price)}</span>
          <ListingBadge vehicle={vehicle} />
        </span>

        {/* Button-in-Button Trailing Icon Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.18)',
            padding: '6px 10px 6px 14px',
            borderRadius: '9999px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}
        >
          <span className="mono" style={{ fontSize: '11px', color: '#fff', fontWeight: 700, letterSpacing: '0.04em' }}>
            DOSSIER
          </span>
          <div className="btn-icon-ring" style={{ width: '22px', height: '22px', background: 'rgba(255,255,255,0.25)', marginLeft: 0 }}>
            <Eye size={12} color="#fff" />
          </div>
        </div>
      </div>

      {/* Mobile body */}
      <div className="vcard-mobile-body">
        <div className="mono vcard-mobile-eyebrow">
          {vehicle.year} <span>/</span> grade {vehicle.grade}
        </div>
        <h3>{vehicle.name}</h3>
        <div className="mono vcard-mobile-spec">
          {Number(vehicle.mileage).toLocaleString()} km · {vehicle.trans === 'Automatic' ? 'Auto' : vehicle.trans}
        </div>
        <div className="vcard-mobile-price-row">
          <span>{formatKES(vehicle.price)}</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </div>
        <div className="mono vcard-mobile-dossier">Dossier ready</div>
      </div>
    </a>
  );
};

