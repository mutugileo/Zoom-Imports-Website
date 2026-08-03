import React from 'react';
import { Img } from './Img';
import { clickableCard } from '../lib/clickable';
import { ListingBadge } from './ListingBadge';
import { pathFor } from '../lib/router';
import { ArrowUpRight } from 'lucide-react';

/**
 * Vehicle card — the photo is the card.
 *
 * Details sit in a ringed panel at top right. The panel fill (0.72) and the
 * foot scrim are measured against every catalogue photo at card size, worst
 * pixel, to clear WCAG AA — a card can show any vehicle, so it cannot rely on
 * one obliging image.
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
      <div className="zoom-frame" style={{ position: 'absolute', inset: 0 }}>
        <Img src={vehicle.img} alt={vehicle.name} sizes="(max-width: 900px) 100vw, 32vw" />
      </div>

      <div className="vcard-scrim" aria-hidden="true" />

      {/* Details panel — faint ring, right-aligned so it reads inward */}
      <div className="vcard-panel">
        <div className="mono vcard-panel-eyebrow">
          {vehicle.year} · grade {vehicle.grade}
        </div>

        <h3 className="vcard-name">{vehicle.name}</h3>

        <div className="mono vcard-chassis">{vehicle.chassis}</div>

        <div className="vcard-rule" />

        <div className="mono vcard-specs">
          {Number(vehicle.mileage).toLocaleString()} km
          <span className="vcard-sep">/</span>
          {vehicle.trans}
        </div>
      </div>

      {/* Status stays top left so it never collides with the panel */}
      <span className={`badge badge-${statusTone} vcard-status`}>{vehicle.status}</span>

      {/* Price and provenance stack together: who is selling is only useful at
          the moment the price is read, not as a separate glance. */}
      <div className="vcard-foot">
        <span className="vcard-foot-stack">
          <span className="vcard-price">{formatKES(vehicle.price)}</span>
          <ListingBadge vehicle={vehicle} />
        </span>
        <ArrowUpRight size={18} color="rgba(238,242,247,0.85)" />
      </div>

      {/* A purpose-built phone summary. At two cards across there is no room
          for the desktop photo plate, chassis row, seller badge and price to
          compete. Mobile keeps the four facts needed to compare, then lets the
          dossier carry the rest after the tap. */}
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
