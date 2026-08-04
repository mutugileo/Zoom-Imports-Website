import React from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Phone, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { pathFor } from '../lib/router';
import { SiteIcon } from './SiteIcon';

const COLUMNS = [
  {
    title: 'Vehicles',
    links: [
      { label: 'All stock', view: 'vehicles' },
      { label: 'Book a viewing', view: 'contact' },
      { label: 'How importing works', view: 'about' },
    ],
  },
  {
    title: 'Spare parts',
    links: [
      { label: 'Parts catalogue', view: 'parts' },
      { label: 'Fitment check', view: 'parts' },
      { label: 'Delivery in Nairobi', view: 'contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', view: 'about' },
      { label: 'Visit the yard', view: 'contact' },
      { label: 'Contact', view: 'contact' },
    ],
  },
];

/* Built per render from the contact record the admin portal owns, rather than
   frozen at module scope — the footer used to advertise a different email from
   the contact page. */
const contactRows = (contact) => [
  { icon: MapPin, label: contact.location },
  { icon: Phone, label: contact.phone, href: `tel:${String(contact.phone || '').replace(/\s/g, '')}` },
  ...(contact.email ? [{ icon: Mail, label: contact.email, href: `mailto:${contact.email}` }] : []),
  { icon: Clock, label: 'Mon–Sat · 8:00–18:00' },
  ...(contact.instagram ? [{ icon: Instagram, label: contact.instagram, href: `https://instagram.com/${String(contact.instagram).replace(/^@/, '')}` }] : []),
  ...(contact.facebook ? [{ icon: Facebook, label: contact.facebook, href: `https://facebook.com/${String(contact.facebook).replace(/^@/, '')}` }] : []),
];

/**
 * Two bands, and neither of them stacks.
 *
 * The footer used to be brand grid → contact rail → legal bar, ~440px on every
 * page. Three things were paying for that height:
 *
 * 1. A four-column grid, which on a wide screen stretched four short columns
 *    across the full width and left the middle empty. Flex with natural widths
 *    keeps the content clustered and lets it wrap when it actually needs to.
 * 2. Vertical link lists — three links stacked is three line-boxes plus gaps.
 *    Laid out in a row, each group costs one line.
 * 3. A brand paragraph restating what the About page says at length.
 *
 * The rail and the legal line are both single-line 10px mono, so they share a
 * row. Every link, contact detail and the WhatsApp action survived the fold.
 */
export const Footer = () => {
  const { navigateTo, contact, waNumber } = useApp();
  const year = new Date().getFullYear();

  /**
   * The hero dossier's frosted-glass treatment, borrowed.
   *
   * One thing had to change to bring it here. GlassCard sits at 0.74 alpha
   * because it floats over a dark photograph; the footer floats over the light
   * page wash, so at 0.74 the composite lands on #566777 and the quiet text
   * measures 2.63:1. At 0.92 the composite is #2e4357 and the panel still reads
   * as glass — the blur and the saturate are what sell it, not the opacity.
   *
   * The text alphas were re-solved against that composite: 0.52 gave 3.72:1, so
   * the column titles and the legal line sit at 0.68 (5.15:1).
   */
  return (
    <footer style={{ background: 'rgba(30, 52, 73, 0.92)', color: 'var(--text-on-ink)', borderTop: '1px solid rgba(255,255,255,0.16)', backdropFilter: 'blur(14px) saturate(1.2)', WebkitBackdropFilter: 'blur(14px) saturate(1.2)' }}>
      <div
        className="footer-top"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '22px 44px',
          padding: '28px var(--gutter) 24px',
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'var(--text-xl)', color: '#fff', marginBottom: '2px' }}>
            Zoom Imports
          </div>
          <div className="mono" style={{ color: 'var(--accent-light)' }}>
            Nairobi · Est. 2014
          </div>
        </div>

        <nav className="footer-nav" style={{ display: 'flex', flexWrap: 'wrap', gap: '18px 40px' }}>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="mono" style={{ color: 'rgba(238,242,247,0.68)', marginBottom: '8px' }}>
                {col.title}
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={pathFor(link.view)}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                        e.preventDefault();
                        navigateTo(link.view);
                      }}
                      className="link-draw"
                      style={{ fontSize: 'var(--text-sm)', color: 'rgba(238,242,247,0.86)' }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Kept, despite the CTA band sitting right above it on the homepage —
            the footer is on all eight views and most of them have no other
            WhatsApp affordance. Inline here, so it costs no extra height. */}
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ padding: '9px 15px', fontSize: 'var(--text-sm)', flexShrink: 0 }}
        >
          <MessageSquare size={14} /> WhatsApp us
        </a>
      </div>

      {/* Contact details and the legal line share one row — both are single-line
          mono, so stacking them was spending 100px to say two short things. */}
      <div
        className="footer-rail"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.14)',
          padding: '13px var(--gutter)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '14px 24px', flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px 22px', flexWrap: 'wrap' }}>
          {contactRows(contact).map(({ icon: Icon, label, href }) => {
            const inner = (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SiteIcon icon={Icon} variant="footer" size={13} />
                <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'rgba(238,242,247,0.78)' }}>{label}</span>
              </span>
            );
            return href
              ? <a key={label} href={href} className="link-draw">{inner}</a>
              : <React.Fragment key={label}>{inner}</React.Fragment>;
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span className="mono" style={{ fontSize: 'var(--text-xs)', color: 'rgba(238,242,247,0.68)' }}>
            © {year} Zoom Imports · Prices in KES, duty inclusive unless stated
          </span>

          <a
            href="https://codzure-solutions.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              textDecoration: 'none',
            }}
            className="codzure-badge"
          >
            <span style={{ color: 'rgba(238,242,247,0.7)' }}>Developed and maintained by:</span>
            <span style={{ color: 'var(--accent-light, #7dd3fc)', fontWeight: 600 }}>Codzure Solutions</span>
          </a>
        </div>
      </div>

      <style>{`
        .codzure-badge {
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .codzure-badge:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          border-color: rgba(255, 255, 255, 0.28) !important;
        }

        /* Flex handles the intermediate widths on its own — the nav groups wrap
           before the links inside them do. Only the narrowest case needs help,
           where space-between would strand the WhatsApp button on its own line
           against the right edge. */
        @media (max-width: 640px) {
          .footer-top { justify-content: flex-start !important; gap: 20px 28px !important; }
          .footer-nav { gap: 16px 28px !important; }
        }
      `}</style>
    </footer>
  );
};
