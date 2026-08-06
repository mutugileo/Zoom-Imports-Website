import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useReveal, revealStyle } from '../lib/useReveal';
import { MapPin, Phone, Mail, Clock, CheckCircle2, ShieldCheck, MessageSquare, Anchor, ChevronDown } from 'lucide-react';
import { SiteIcon } from '../components/SiteIcon';

export const AboutPage = () => {
  const { navigateTo } = useApp();
  const [statsRef, statsShown] = useReveal();
  const [promiseRef, promiseShown] = useReveal();
  const [partnersRef, partnersShown] = useReveal();

  return (
    <div className="animate-fade-in" style={{ padding: '36px var(--gutter) 60px', maxWidth: '1140px', margin: '0 auto' }}>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)', marginBottom: '16px' }}>Home / About Us</div>

      {/* ───────────── 1. About & Commitment Side-by-Side Section ───────────── */}
      <section style={{ marginBottom: '56px' }}>
        <div
          className="about-top-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            alignItems: 'stretch',
          }}
        >
          {/* Left Card: About Zoom Imports Kenya */}
          <div
            ref={statsRef}
            className="about-info-card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--band-line)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
              ...revealStyle(statsShown),
            }}
          >
            <div>
              <div className="mono" style={{ color: 'var(--accent)', marginBottom: '8px' }}>
                Who We Are
              </div>
              <h1
                style={{
                  fontFamily: 'Source Serif 4, serif',
                  fontWeight: 600,
                  fontSize: 'var(--text-3xl)',
                  color: 'var(--text-dark)',
                  marginBottom: '14px',
                  lineHeight: 1.2,
                }}
              >
                About Zoom Imports Kenya
              </h1>
              <p
                style={{
                  fontSize: 'var(--text-base)',
                  lineHeight: 1.65,
                  color: 'var(--text-body)',
                }}
              >
                Zoom Imports is Nairobi’s premier dealer in hand-picked foreign used import vehicles and genuine OEM spare parts. Located along K-Mall, Kiambu Rd, Thindigua, we bridge the gap between quality international sourcing and transparent local delivery.
              </p>
            </div>

            {/* Stats Sub-Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
              }}
              className="about-stats-grid"
            >
              {[
                { figure: '500+', tone: 'var(--primary)', label: 'Vehicles handed over', sub: 'Verified Japan auction grades' },
                { figure: '100%', tone: 'var(--accent)', label: 'Genuine spare parts', sub: '12-month warranty cover' },
                { figure: '24 hrs', tone: '#2f6690', label: 'Nairobi delivery', sub: 'Fast dispatch to your location' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="about-stat"
                  style={{
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    padding: '14px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 700,
                      fontFamily: 'var(--font-serif)',
                      color: s.tone,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {s.figure}
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.3 }}>{s.label}</div>
                    <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Card: Our Commitment / Promise */}
          <div
            ref={promiseRef}
            className="about-promise-card"
            style={{
              background: 'var(--ink-raised)',
              color: '#fff',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
              ...revealStyle(promiseShown),
            }}
          >
            <div>
              <div className="mono" style={{ color: 'var(--accent-light)', fontSize: 'var(--text-xs)', marginBottom: '8px' }}>
                Our Commitment
              </div>
              <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 'var(--text-3xl)', margin: '0 0 20px 0', color: '#fff', lineHeight: 1.2 }}>
                Our Import Promise
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <SiteIcon icon={CheckCircle2} variant="dark" size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)' }}>
                    <strong>Documented, not asserted:</strong> Each listing carries the chassis number, the Japanese auction grade and the inspection it was given — printed from the record, so you can check them yourself.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <SiteIcon icon={CheckCircle2} variant="dark" size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)' }}>
                    <strong>Duty stated per car:</strong> Each listing says whether import duty is settled, so the figure you see is the figure to drive it away — or you know it is not.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <SiteIcon icon={CheckCircle2} variant="dark" size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.55, color: 'rgba(255,255,255,.9)' }}>
                    <strong>Fitment on record:</strong> Parts list the Mazda models they are mapped to. If a fit is not recorded, we say so rather than guess.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateTo('vehicles')}
              className="btn-primary"
              style={{
                background: 'var(--accent)',
                width: '100%',
                padding: '12px 20px',
                textAlign: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                color: '#fff',
              }}
            >
              Explore Vehicle Inventory
            </button>
          </div>
        </div>
      </section>

      {/* ───────────── 2. Our Partners: Three yards, one chain of custody (Horizontal 3-column cards) ───────────── */}
      <section ref={partnersRef} style={{ ...revealStyle(partnersShown) }}>
        <div className="mono" style={{ color: 'var(--accent)', marginBottom: '8px' }}>
          Our partners
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-serif)', fontWeight: 600,
            fontSize: 'var(--text-fluid-xl)', letterSpacing: '-0.02em',
            color: 'var(--text-dark)', lineHeight: 1.15, marginBottom: '10px',
          }}
        >
          Three yards, one chain of custody
        </h2>
        <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '780px' }}>
          Every car is bought at a Japanese auction, inspected before export and
          cleared through Mombasa. The chassis number and auction grade on each
          listing come from that paperwork.
        </p>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .about-top-grid { grid-template-columns: 1fr !important; }
          .about-stats-grid { grid-template-columns: 1fr !important; }
          .partners-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 500px) {
          .about-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export const ContactPage = () => {
  const { submitEnquiry, contact, faqs } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSendError('');
    setSending(true);
    const result = await submitEnquiry({
      name,
      phone,
      vehicleName: message || 'General Contact Message',
      type: 'General Enquiry'
    });
    setSending(false);
    if (!result.ok) { setSendError(result.reason); return; }
    setSent(true);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '36px var(--gutter) 60px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="mono" style={{ color: 'var(--text-dim)', marginBottom: '10px' }}>Home / Contact</div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-5xl)', color: 'var(--text-dark)', marginBottom: '24px' }}>
        Contact Us
      </h1>

      {/* No alignItems: the default stretch makes both cards share the row
          height, so the pair reads as one block rather than two ragged ones. */}
      <div className="split-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px' }}>

        {/* Contact Details */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-dark)' }}>Get in Touch</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SiteIcon icon={MapPin} variant="contact" size={19} />
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)' }}>Showroom & Depot Address</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{contact.location}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SiteIcon icon={Phone} variant="contact" size={19} />
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)' }}>Direct Phone / WhatsApp</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{contact.phone}</div>
            </div>
          </div>

          {/* Only rendered once there is an address to render. With
              site_contact.email blank this printed the heading over an empty
              line, which reads as a broken row rather than as a channel the
              yard does not offer. */}
          {contact.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SiteIcon icon={Mail} variant="contact" size={19} />
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)' }}>Email Inquiry</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{contact.email}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SiteIcon icon={Clock} variant="contact" size={19} />
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)' }}>Working Hours</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Mon - Sat: 8:00 AM – 6:00 PM (Closed Sundays)</div>
            </div>
          </div>
        </div>

        {/* Form — column layout so the form fills the shared row height and the
            submit button lands on the card's bottom edge, level with the last
            contact row opposite. */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '16px' }}>Send Us a Message</h3>

          {sent ? (
            <div style={{ padding: '20px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
              Message received! We will reach out to you via phone/WhatsApp shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              <div>
                <label className="field-label">Your Name *</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="field" 
                />
              </div>

              <div>
                <label className="field-label">Phone Number *</label>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="field" 
                />
              </div>

              <div>
                <label className="field-label">Message / Inquiry</label>
                <textarea 
                  rows="4" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  className="field" 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: 'auto' }}>
                Send Message
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Answers the yard maintains itself.
          These are edited on the admin portal's Site Content screen and, until
          now, were written into a store nothing on the website ever read — a
          form that saved into a void. Questions first, policies after. */}
      <FaqSection
        title="Common questions"
        entries={faqs.filter((f) => f.type !== 'Legal')}
      />
      <FaqSection
        title="Policies &amp; terms"
        entries={faqs.filter((f) => f.type === 'Legal')}
      />
    </div>
  );
};

/**
 * Native <details>, not a hand-rolled accordion: it is open/closed without
 * JavaScript, it is keyboard-operable for free, and browser find-in-page can
 * reach the text inside a collapsed answer.
 */
const FaqSection = ({ title, entries }) => {
  if (!entries.length) return null;
  return (
    <section style={{ marginTop: '44px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-3xl)', color: 'var(--text-dark)', marginBottom: '14px', letterSpacing: '-0.015em' }}>
        {title}
      </h2>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {entries.map((f, i) => (
          <details
            key={f.id ?? f.question}
            style={{ borderTop: i === 0 ? 'none' : '1px solid var(--band-line)' }}
          >
            <summary
              style={{
                cursor: 'pointer', padding: '15px 20px', fontSize: 'var(--text-base)',
                fontWeight: 600, color: 'var(--text-dark)', listStyle: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px',
              }}
            >
              {f.question}
              <ChevronDown size={16} color="var(--text-dim)" style={{ flexShrink: 0 }} />
            </summary>
            <div style={{ padding: '0 20px 17px', fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--text-body)', maxWidth: '72ch' }}>
              {f.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};
