import React from 'react';
import { Img } from './Img';
import { clickableCard } from '../lib/clickable';
import { ListingBadge } from './ListingBadge';
import { pathFor } from '../lib/router';
import { ArrowUpRight, Calendar, Gauge, ShieldCheck, Fuel, Eye } from 'lucide-react';

/**
 * Vehicle card — photo plate with spec icons, status badge, and hover overlay action.
 */
export const VehicleCard = ({ vehicle, vehicles = [], formatKES, onOpen, style, height = 300 }) => {
  const statusTone =
    vehicle.status === 'Available' ? 'available' :
    vehicle.status === 'Reserved' ? 'reserved' : 'sold';

  return (
    <a
      className="hover-card vcard"
      {...clickableCard(
        onOpen,
        `${vehicle.name}, ${vehicle.year}, ${formatKES(vehicle.price)}`,
        pathFor('vehicle-detail', { id: vehicle.id, vehicles }),
      )}
      style={{
        position: 'relative',
        minHeight: `${height}px`,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--ink)',
        display: 'flex',
        ...style,
      }}
    >
      <div className="zoom-frame" style={{ position: 'absolute', inset: 0, transition: 'transform 350ms ease' }}>
        <Img src={vehicle.img} alt={vehicle.name} sizes="(max-width: 900px) 100vw, 32vw" />
      </div>

      <div className="vcard-scrim" aria-hidden="true" />

      {/* Details panel */}
      <div className="vcard-panel">
        <div className="mono vcard-panel-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={12} color="var(--accent-light)" />
          {vehicle.year} · <ShieldCheck size={12} color="var(--verify)" /> grade {vehicle.grade}
        </div>

        <h3 className="vcard-name">{vehicle.name}</h3>

        <div className="mono vcard-chassis">{vehicle.chassis}</div>

        <div className="vcard-rule" />

        <div className="mono vcard-specs" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gauge size={12} color="rgba(255,255,255,0.7)" />
          {Number(vehicle.mileage).toLocaleString()} km
          <span className="vcard-sep">/</span>
          {vehicle.fuel || 'Petrol'}
        </div>
      </div>

      {/* Status */}
      <span className={`badge badge-${statusTone} vcard-status`}>{vehicle.status}</span>

      {/* Price and foot */}
      <div className="vcard-foot">
        <span className="vcard-foot-stack">
          <span className="vcard-price">{formatKES(vehicle.price)}</span>
          <ListingBadge vehicle={vehicle} />
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.15)', padding: '5px 10px', borderRadius: '999px', backdropFilter: 'blur(6px)' }}>
          <Eye size={13} color="#fff" />
          <span className="mono" style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>Dossier</span>
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

