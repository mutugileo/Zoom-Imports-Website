import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useReveal, revealStyle } from '../lib/useReveal';
import { PARTNER_YARDS } from '@shared/data/siteContent';
import { MapPin, Phone, Mail, Clock, CheckCircle2, ShieldCheck, MessageSquare, Anchor, ChevronDown } from 'lucide-react';
import { SiteIcon } from '../components/SiteIcon';

export const AboutPage = () => {
  const { navigateTo } = useApp();
  const [statsRef, statsShown] = useReveal();
  const [promiseRef, promiseShown] = useReveal();
  const [partnersRef, partnersShown] = useReveal();

  return (
    <div className="animate-fade-in" style={{ padding: '36px var(--gutter) 60px', maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)', marginBottom: '6px' }}>Home / About Us</div>

      {/* Two halves: who we are on the left, the chain that backs it on the
          right. The partner column is the evidence for the claims beside it,
          so the two are read together rather than one after the other. */}
      <div className="about-parallel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>

      <div className="about-main">
      <h1 style={{ fontFamily: 'Source Serif 4, serif', fontWeight: 600, fontSize: 'var(--text-5xl)', color: '#16232e', marginBottom: '16px' }}>
        About Zoom Imports Kenya
      </h1>
      
      <p style={{ fontSize: 'var(--text-lg)', lineHeight: 1.7, color: '#333d49', marginBottom: '28px' }}>
        Zoom Imports is Nairobi’s premier dealer in hand-picked foreign used import vehicles and genuine OEM spare parts. Located along Mombasa Road, we bridge the gap between quality international sourcing and transparent local delivery.
      </p>

      {/* Laid out horizontally: the figure sits beside its label rather than on
          top of it, so the three read as one line of evidence across the page
          instead of three separate stacked plaques. */}
      <div ref={statsRef} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '26px', ...revealStyle(statsShown) }}>
        {[
          { figure: '500+', tone: 'var(--primary)', label: 'Vehicles handed over', sub: 'Fully verified Japan auction grades' },
          { figure: '100%', tone: 'var(--accent)', label: 'Genuine spare parts', sub: 'Backed by 12-month warranty cover' },
          { figure: '24 hrs', tone: '#2f6690', label: 'Nairobi delivery', sub: 'Fast dispatch to your mechanic or home' },
        ].map((s) => (
          <div
            key={s.label}
            className="about-stat"
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--band-line)',
              borderRadius: '10px', padding: '20px', boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-4xl)', fontWeight: 700, fontFamily: 'var(--font-serif)',
                color: s.tone, lineHeight: 1, flexShrink: 0, letterSpacing: '-0.02em',
              }}
            >
              {s.figure}
            </div>
            {/* The rule does the separating, so the two halves stay distinct
                without a gap wide enough to break the line. */}
            <div style={{ alignSelf: 'stretch', width: '1px', background: 'var(--band-line)', flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)' }}>{s.label}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.45 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div ref={promiseRef} className="about-promise" style={{ background: '#1e3449', color: '#fff', borderRadius: '12px', padding: '30px 28px', display: 'flex', flexDirection: 'column', gap: '16px', ...revealStyle(promiseShown) }}>
        <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 'var(--text-3xl)' }}>Our Import Promise</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-base)', color: 'rgba(255,255,255,.85)' }}>
            <SiteIcon icon={CheckCircle2} variant="dark" size={16} /> Every vehicle is verified for non-accident history and certified mileage before shipment.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-base)', color: 'rgba(255,255,255,.85)' }}>
            <SiteIcon icon={CheckCircle2} variant="dark" size={16} /> No hidden fees — our prices include all duty, VAT, and clearing charges.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-base)', color: 'rgba(255,255,255,.85)' }}>
            <SiteIcon icon={CheckCircle2} variant="dark" size={16} /> Genuine spare parts are guaranteed compatible with Kenyan vehicle specs.
          </div>
        </div>

        <button onClick={() => navigateTo('vehicles')} className="btn-primary" style={{ width: 'fit-content', marginTop: '12px', background: 'var(--accent)' }}>
          Explore Vehicle Inventory
        </button>
      </div>

      </div>

      {/* Our Partners — the three yards a car passes through, in order.
          Ordered deliberately: it reads as the journey the vehicle takes, which
          is the same sequence the homepage rail sets out, so the two agree. */}
      <section ref={partnersRef} style={{ ...revealStyle(partnersShown) }}>
        <div className="mono" style={{ color: 'var(--accent)', marginBottom: '8px' }}>
          Our partners
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-serif)', fontWeight: 600,
            fontSize: 'var(--text-fluid-md)', letterSpacing: '-0.02em',
            color: 'var(--text-dark)', lineHeight: 1.15, marginBottom: '8px',
          }}
        >
          Three yards, one chain of custody
        </h2>
        <p style={{ fontSize: 'var(--text-base)', lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: '18px' }}>
          Every car we sell passes through the same three yards, in the same order.
          That is what lets us put a chassis number and an auction grade on a listing
          and stand behind both.
        </p>

        {/* Stacked cards with a horizontal head. In a half-width column the
            full-width row could not hold stage, yard and detail on one line
            without crushing the detail, so the identity stays horizontal —
            stage beside the city, the way a manifest line reads — and the
            description drops below its own rule. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PARTNER_YARDS.map((yard, i) => (
            <article
              key={yard.id}
              className="partner-row"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--band-line)',
                borderRadius: '12px',
                padding: '16px 18px',
                boxShadow: 'var(--shadow-sm)',
                ...revealStyle(partnersShown, i + 1),
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  className="mono partner-stage"
                  style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', flexShrink: 0 }}
                >
                  Stage {String(i + 1).padStart(2, '0')}
                </span>

                <div style={{ width: '1px', alignSelf: 'stretch', minHeight: '26px', background: 'var(--band-line)', flexShrink: 0 }} />

                <div style={{ flex: 1, minWidth: 0 }} className="partner-place">
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-xl)', color: 'var(--text-dark)', lineHeight: 1.2 }}>
                    {yard.city}
                  </h3>
                  <div className="mono" style={{ color: 'var(--accent)', fontSize: 'var(--text-2xs)', marginTop: '2px' }}>
                    {yard.country} &middot; since {yard.since}
                  </div>
                </div>

                <Anchor size={15} color="var(--verify)" aria-hidden="true" style={{ flexShrink: 0 }} />
              </div>

              <div style={{ borderTop: '1px solid var(--band-line)', marginTop: '12px', paddingTop: '11px' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-body)', marginBottom: '3px' }}>
                  {yard.role}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
                  {yard.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      </div>
    </div>
  );
};

export const ContactPage = () => {
  const { submitEnquiry, contact, faqs } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitEnquiry({
      name,
      phone,
      vehicleName: message || 'General Contact Message',
      type: 'General Enquiry'
    });
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SiteIcon icon={Mail} variant="contact" size={19} />
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)' }}>Email Inquiry</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{contact.email}</div>
            </div>
          </div>

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
