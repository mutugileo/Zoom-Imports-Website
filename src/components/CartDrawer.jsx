import React, { useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useFocusTrap } from '@shared/lib/useFocusTrap';
import { Img } from './Img';
import { setScrollLocked } from '../lib/useLenis';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export const CartDrawer = () => {
  const {
    isCartOpen, setIsCartOpen, cart, updateCartQty,
    removeFromCart, cartSubtotal, formatKES, navigateTo,
  } = useApp();

  const close = useCallback(() => setIsCartOpen(false), [setIsCartOpen]);

  // Focus goes in on open and back to the trigger on close.
  const trapRef = useFocusTrap(isCartOpen);

  useEffect(() => {
    if (!isCartOpen) return undefined;
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, [isCartOpen]);

  useEffect(() => {
    if (!isCartOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isCartOpen, close]);

  if (!isCartOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', justifyContent: 'flex-end' }}>
      <div
        onClick={close}
        style={{ position: 'absolute', inset: 0, background: 'rgba(20,23,28,0.62)', backdropFilter: 'blur(4px)' }}
      />

      <aside
        ref={trapRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        style={{
          position: 'relative', width: '420px', maxWidth: '100%', height: '100%',
          background: 'var(--bg-card)', boxShadow: '-14px 0 44px rgba(0,0,0,0.28)',
          display: 'flex', flexDirection: 'column', zIndex: 1,
          animation: 'fadeIn 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <header
          style={{
            padding: '20px 22px', borderBottom: '1px solid var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          }}
        >
          <div>
            <div className="mono" style={{ color: 'var(--text-dim)', marginBottom: '3px' }}>
              Parts counter
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-xl)', color: 'var(--text-dark)' }}>
              Your order
            </h2>
          </div>
          <button
            onClick={close}
            aria-label="Close cart"
            style={{
              background: 'var(--bg-cream)', border: 'none', borderRadius: '999px',
              width: '34px', height: '34px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <X size={16} color="var(--text-muted)" />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {cart.length === 0 ? (
            <div
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: '12px', textAlign: 'center',
              }}
            >
              <ShoppingBag size={42} color="#d8dde2" />
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-dark)' }}>
                Nothing here yet
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: '32ch', lineHeight: 1.6 }}>
                Add genuine parts matched to your chassis and we will confirm stock on WhatsApp.
              </p>
              <button
                onClick={() => { close(); navigateTo('parts'); }}
                className="btn-primary"
                style={{ marginTop: '6px' }}
              >
                Browse spare parts
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <article
                key={item.id}
                style={{
                  display: 'flex', gap: '12px', padding: '12px',
                  background: 'var(--bg-app)', border: '1px solid var(--border-light)',
                  borderRadius: '10px',
                }}
              >
                <div style={{ width: '68px', height: '68px', borderRadius: '7px', overflow: 'hidden', flexShrink: 0 }}>
                  <Img src={item.img} alt={item.name} sizes="68px" />
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div className="mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-dim)' }}>{item.brand}</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1.3 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--primary-ink)', marginTop: '3px' }}>
                      {formatKES(item.price)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)',
                        border: '1px solid var(--border-medium)', borderRadius: '6px', padding: '3px 8px',
                      }}
                    >
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        aria-label={`Reduce ${item.name} quantity`}
                        style={iconBtn}
                      >
                        <Minus size={12} color="var(--text-muted)" />
                      </button>
                      <span className="mono" style={{ fontSize: 'var(--text-xs)', minWidth: '16px', textAlign: 'center', color: 'var(--text-dark)' }}>
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        aria-label={`Increase ${item.name} quantity`}
                        style={iconBtn}
                      >
                        <Plus size={12} color="var(--text-muted)" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.name}`}
                      style={{ ...iconBtn, color: '#a13f3f' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <footer style={{ padding: '18px 22px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '7px' }}>
              <span>Delivery</span>
              <span style={{ color: 'var(--text-body)' }}>Quoted at checkout</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <span style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-dark)' }}>Subtotal</span>
              <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--primary-ink)' }}>
                {formatKES(cartSubtotal)}
              </span>
            </div>

            <button
              onClick={() => { close(); navigateTo('checkout'); }}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 'var(--text-base)' }}
            >
              Checkout <ArrowRight size={16} />
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
};

const iconBtn = {
  border: 'none', background: 'transparent', cursor: 'pointer',
  display: 'flex', alignItems: 'center', padding: '2px',
};
