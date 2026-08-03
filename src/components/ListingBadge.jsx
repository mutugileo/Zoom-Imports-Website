import React from 'react';
import { listingOf } from '@shared/lib/format';
import { Crown, Tag, BadgeCheck, User } from 'lucide-react';

const ICON_MAP = {
  owned: Crown,
  seller: Tag,
  verified: BadgeCheck,
  private: User,
};

/**
 * Who is selling this car.
 *
 * One component so the wording cannot drift between the card, the detail page
 * and the admin table — the same drift that once had the shop saying "Only 4
 * left" while the detail page said "Low Stock".
 *
 * The label comes from LISTING_TYPES, and an unknown value falls back to
 * "Listed by Seller" rather than to a trust claim: a car with no provenance
 * recorded must never render as verified.
 */
export const ListingBadge = ({ vehicle, className = '', style, showIcon = true }) => {
  const { label, tone } = listingOf(vehicle);
  const IconComponent = ICON_MAP[tone] || Tag;

  return (
    <span className={`badge badge-${tone} badge-listing-${tone} ${className}`.trim()} style={style}>
      {showIcon && <IconComponent size={13} className="badge-icon" aria-hidden="true" />}
      <span>{label}</span>
    </span>
  );
};
