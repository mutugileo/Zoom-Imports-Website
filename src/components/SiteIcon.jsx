import React from 'react';

/**
 * Shared frame for customer-facing Lucide icons.
 *
 * The surrounding text or control owns the accessible name. Keeping the icon
 * decorative avoids duplicate announcements while one stroke weight and one
 * family keep trust, specification and contact surfaces visually related.
 */
export const SiteIcon = ({ icon: Icon, variant = 'feature', size = 18, className = '' }) => (
  <span className={`site-icon site-icon-${variant}${className ? ` ${className}` : ''}`} aria-hidden="true">
    <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
  </span>
);
