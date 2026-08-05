import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Img } from '../components/Img';
import { useReveal, revealStyle } from '../lib/useReveal';
import { useAddedFlash } from '../lib/useAddedFlash';
import { stockLabel, stockClass } from '@shared/lib/format';
import { rulePartId } from '@shared/lib/compatibility';
import { ShoppingCart, MessageSquare, Check, ShieldCheck, Plus, Minus, Truck, ArrowLeft } from 'lucide-react';
import { SiteIcon } from '../components/SiteIcon';

export const SparePartDetailPage = () => {
  const { selectedPartId, parts, compatibility, navigateTo, navigateBackFromDetail, formatKES, addToCart, waNumber } = useApp();

  const part = parts.find(p => String(p.id) === String(selectedPartId)) || parts[0];
  const [qty, setQty] = useState(1);
  const [fitRef, fitShown] = useReveal();
  const [added, confirm] = useAddedFlash();

  /**
   * Everything the counter records about a part, on the page a buyer reads
   * before ordering. The card already showed the SKU and the OEM number; the
   * detail page used to show less than the card it came from, which is exactly
   * backwards — this is the page someone opens to check the number against the
   * one on the old component.
   *
   * A blank OEM number says "on request" rather than disappearing. Silence
   * reads as "not genuine", and inventing a number would fail at the counter
   * instead of on the website.
   */
  const specs = [
    ['Part number (OEM)', part.partNumber || 'On request — send us your chassis'],
    ['Our stock code', part.sku || '—'],
    ['Brand', part.brand],
    ['Category', part.category],
    ['Fits', part.compat],
    ['In stock', part.stock > 0 ? `${part.stock} available` : 'Out of stock — ask us to order it'],
  ];

  /* By part id. Matching on the name meant renaming a part in the admin screen
     quietly detached every fitment row from it. */
  const matchingRules = compatibility.filter((c) => rulePartId(c, parts) === part.id);

  return (
    <div style={{ padding: '20px var(--gutter) 48px' }}>
      
      {/* Back button & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => navigateBackFromDetail('parts')}
          className="mono link-draw"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={14} /> All spare parts
        </button>

        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)' }}>
          <span onClick={() => navigateTo('home')} style={{ cursor: 'pointer' }}>Home</span> / <span onClick={() => navigateBackFromDetail('parts')} style={{ cursor: 'pointer' }}>Spare Parts</span> / <strong style={{ color: '#16232e' }}>{part.name}</strong>
        </div>
      </div>

      <div className="split-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px', alignItems: 'flex-start' }}>
        
        {/* Left: Image & Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ width: '100%', height: '380px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(27,36,48,.1)', background: '#fff' }}>
            <Img src={part.img} alt={part.name} sizes="(max-width: 860px) 100vw, 46vw" loading="eager" />
          </div>

          <div ref={fitRef} style={revealStyle(fitShown)}>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: '#16232e', marginBottom: '10px' }}>
              Compatible Vehicle Models
            </h3>
            <div style={{ background: '#fff', border: '1px solid rgba(27,36,48,.1)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {matchingRules.length === 0 ? (
                <div style={{ fontSize: 'var(--text-sm)', color: '#5f6b7a' }}>Compatible with most {part.compat} vehicles. Contact us to verify your chassis number.</div>
              ) : (
                matchingRules.map(rule => (
                  <div key={rule.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: 'var(--text-sm)' }}>
                    <span style={{ fontWeight: 600, color: '#1b5566' }}>{rule.make} {rule.model}</span>
                    <span style={{ color: '#5f6b7a' }}>Years: {rule.years}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Price & Cart Actions */}
        <div style={{ background: '#fff', border: '1px solid rgba(27,36,48,.1)', borderRadius: '12px', padding: '28px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#5f6b7a', textTransform: 'uppercase' }}>
                {part.brand} · {part.category}
              </span>
              <span className={`badge badge-${stockClass(part.stock)}`}>
                {stockLabel(part.stock)}
              </span>
            </div>

            <h1 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 'var(--text-4xl)', fontWeight: 600, color: '#16232e' }}>
              {part.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '12px' }}>
              <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, fontFamily: 'Source Serif 4, serif', color: '#1b5566' }}>
                {formatKES(part.promo || part.price)}
              </span>
              {part.promo && (
                <span style={{ fontSize: 'var(--text-lg)', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                  {formatKES(part.price)}
                </span>
              )}
            </div>
          </div>

          <div style={{ fontSize: 'var(--text-base)', lineHeight: 1.6, color: '#333d49', background: '#f9f8f6', padding: '16px', borderRadius: '8px' }}>
            {part.description}
          </div>

          {/* Specification — the counter's own record of this part */}
          <div style={{ border: '1px solid rgba(27,36,48,.1)', borderRadius: '8px', padding: '2px 16px' }}>
            {specs.map(([label, value], i) => (
              <div
                key={label}
                style={{
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                  gap: '16px', padding: '11px 0',
                  borderBottom: i === specs.length - 1 ? 'none' : '1px solid rgba(27,36,48,.08)',
                }}
              >
                <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-dark)', textAlign: 'right' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#16232e' }}>Quantity:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#eef2f7', border: '1px solid #d8dde2', borderRadius: '6px', padding: '6px 12px' }}>
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Minus size={14} color="#5f6b7a" />
              </button>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{qty}</span>
              <button 
                onClick={() => setQty(qty + 1)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Plus size={14} color="#5f6b7a" />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Adds and stays put — the shopper opens the cart when they are
                ready, not because the page decided for them. */}
            <button
              onClick={() => { addToCart(part, qty); confirm(); }}
              className="btn-primary"
              disabled={part.stock === 0}
              style={{
                padding: '14px', fontSize: 'var(--text-base)', width: '100%',
                background: added ? 'var(--verify)' : undefined,
                opacity: part.stock === 0 ? 0.5 : 1,
                cursor: part.stock === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {part.stock === 0 ? (
                'Out of stock'
              ) : added ? (
                <><Check size={16} strokeWidth={3} /> Added to cart</>
              ) : (
                <><ShoppingCart size={16} /> Add to Cart ({formatKES((part.promo || part.price) * qty)})</>
              )}
            </button>

            <a 
              href={`https://wa.me/${waNumber}?text=Hello%20Zoom%20Imports%2C%20I%20want%20to%20order%20the%20${encodeURIComponent(part.name)}%20(${qty}%20unit(s)).`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp" 
              style={{ padding: '14px', fontSize: 'var(--text-base)', width: '100%', justifyContent: 'center' }}
            >
              <MessageSquare size={16} /> Instant Order via WhatsApp
            </a>
          </div>

          <div style={{ borderTop: '1px solid rgba(27,36,48,.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', color: '#333d49' }}>
              <SiteIcon icon={ShieldCheck} variant="trust" size={16} /> {part.brand ? `${part.brand} — supplied as listed` : 'Supplied as listed'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', color: '#333d49' }}>
              <SiteIcon icon={Truck} variant="trust" size={16} /> Delivery in Nairobi or collection from the depot
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
