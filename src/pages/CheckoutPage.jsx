import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, MessageSquare, ArrowLeft, Truck, MapPin, ShoppingBag } from 'lucide-react';

export const CheckoutPage = () => {
  const { cart, cartSubtotal, formatKES, submitOrder, navigateTo, waNumber, contact } = useApp();

  // Empty by default — a form pre-filled with a sample customer produces
  // real orders addressed to nobody.
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [delivery, setDelivery] = useState('Delivery');
  const [address, setAddress] = useState('');

  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  /**
   * The order now goes to the server, so the confirmation waits for it.
   *
   * Showing a reference number before the write lands would hand someone a
   * receipt for an order the yard never received — the one failure a checkout
   * must never have.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (delivery === 'Delivery' && !address.trim()) return;

    setOrderError('');
    setPlacing(true);
    const result = await submitOrder({ name, phone, email, delivery, address });
    setPlacing(false);

    if (!result.ok) { setOrderError(result.reason); return; }
    setSubmittedOrder(result.order);
  };

  // Order Confirmation View
  if (submittedOrder) {
    return (
      <div className="animate-fade-in" style={{ padding: '60px var(--gutter)', display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: '#fff', border: '1px solid rgba(27,36,48,.1)', borderRadius: '16px', padding: 'clamp(26px, 5vw, 48px)', maxWidth: '560px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={36} color="var(--primary)" />
          </div>

          <h1 style={{ fontFamily: 'Source Serif 4, serif', fontWeight: 600, fontSize: 'var(--text-4xl)', color: 'var(--text-dark)' }}>
            Order Submitted
          </h1>

          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center' }}>
            Thank you, <strong>{submittedOrder.customer}</strong>. Your order reference has been generated below. Our dealership staff will confirm stock and arrange payment with you on WhatsApp.
          </p>

          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--primary)', background: 'var(--text-on-ink)', padding: '14px 32px', borderRadius: '8px', letterSpacing: '.05em', fontFamily: 'monospace' }}>
            {submittedOrder.ref}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '12px' }}>
            <a 
              href={`https://wa.me/${waNumber}?text=Hello%20Zoom%20Imports%2C%20I%20have%20submitted%20order%20${submittedOrder.ref}%20for%20${encodeURIComponent(submittedOrder.itemsFmt)}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp" 
              style={{ padding: '14px', fontSize: 'var(--text-base)', justifyContent: 'center' }}
            >
              <MessageSquare size={16} /> Confirm Order on WhatsApp
            </a>

            <button 
              onClick={() => navigateTo('home')}
              className="btn-secondary" 
              style={{ padding: '14px', fontSize: 'var(--text-base)', width: '100%' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form View
  if (cart.length === 0) {
    return (
      <div className="animate-fade-in" style={{ padding: '80px var(--gutter)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <ShoppingBag size={48} color="var(--text-dim)" />
        <h2 style={{ fontFamily: 'Source Serif 4, serif', fontSize: 'var(--text-3xl)', color: 'var(--text-dark)' }}>
          Your Cart is Empty
        </h2>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)' }}>Add spare parts or accessories to your cart before proceeding to checkout.</p>
        <button onClick={() => navigateTo('parts')} className="btn-primary" style={{ padding: '12px 24px' }}>
          Browse Spare Parts
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '24px var(--gutter) 48px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => navigateTo('parts')}
          style={{ background: 'var(--text-on-ink)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={16} color="var(--text-dark)" />
        </button>
        <h1 style={{ fontFamily: 'Source Serif 4, serif', fontWeight: 600, fontSize: 'var(--text-4xl)', color: 'var(--text-dark)' }}>
          Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="split-2" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '36px', alignItems: 'flex-start' }}>
        
        {/* Left: Contact Info & Delivery Method */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Contact Details */}
          <div style={{ background: '#fff', border: '1px solid rgba(27,36,48,.1)', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-dark)' }}>
              Contact Information
            </h3>

            <div className="pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Full Name *
                </label>
                <input 
                  type="text" 
                  required
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(27,36,48,.16)', outline: 'none', fontSize: 'var(--text-sm)' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Phone Number (WhatsApp) *
                </label>
                <input 
                  type="tel" 
                  required
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(27,36,48,.16)', outline: 'none', fontSize: 'var(--text-sm)' }} 
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                Email Address (Optional)
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(27,36,48,.16)', outline: 'none', fontSize: 'var(--text-sm)' }} 
              />
            </div>
          </div>

          {/* Delivery Method */}
          <div style={{ background: '#fff', border: '1px solid rgba(27,36,48,.1)', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-dark)' }}>
              Delivery Method
            </h3>

            <div className="pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div 
                onClick={() => setDelivery('Delivery')}
                style={{ 
                  background: delivery === 'Delivery' ? 'var(--primary-light)' : '#fff', 
                  border: delivery === 'Delivery' ? '1.5px solid var(--primary)' : '1px solid rgba(27,36,48,.16)', 
                  borderRadius: '8px', 
                  padding: '14px', 
                  textAlign: 'center', 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 600, 
                  color: delivery === 'Delivery' ? 'var(--primary)' : 'var(--text-body)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Truck size={16} /> Nairobi Delivery
              </div>

              <div 
                onClick={() => setDelivery('Collection')}
                style={{ 
                  background: delivery === 'Collection' ? 'var(--primary-light)' : '#fff', 
                  border: delivery === 'Collection' ? '1.5px solid var(--primary)' : '1px solid rgba(27,36,48,.16)', 
                  borderRadius: '8px', 
                  padding: '14px', 
                  textAlign: 'center', 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 600, 
                  color: delivery === 'Collection' ? 'var(--primary)' : 'var(--text-body)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <MapPin size={16} /> Showroom Collection
              </div>
            </div>

            {delivery === 'Delivery' ? (
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Delivery Address / Area in Nairobi *
                </label>
                <input 
                  type="text" 
                  required
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(27,36,48,.16)', outline: 'none', fontSize: 'var(--text-sm)' }} 
                />
              </div>
            ) : (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', background: 'var(--text-on-ink)', padding: '12px 14px', borderRadius: '6px' }}>
                Collection point: <strong>{contact.location}</strong>{contact.hours ? `. Open ${contact.hours}.` : '.'}
              </div>
            )}
          </div>

        </div>

        {/* Right: Order Summary */}
        <div style={{ background: '#fff', border: '1px solid rgba(27,36,48,.1)', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-dark)' }}>
            Order Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid rgba(27,36,48,.1)', paddingBottom: '14px' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-body)' }}>
                <span>{item.name} × {item.qty}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{formatKES(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            <span>Delivery Fee</span>
            <span style={{ fontStyle: 'italic' }}>Confirmed by dealership</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-dark)', borderTop: '1px solid rgba(27,36,48,.1)', paddingTop: '12px' }}>
            <span>Total Payable</span>
            <span style={{ color: 'var(--primary)' }}>{formatKES(cartSubtotal)}</span>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={placing}
            style={{ padding: '14px', fontSize: 'var(--text-base)', marginTop: '8px', opacity: placing ? 0.6 : 1 }}
          >
            {placing ? 'Submitting…' : 'Submit Order'}
          </button>

          {orderError && (
            <div role="alert" style={{ fontSize: 'var(--text-sm)', color: '#a13f3f', textAlign: 'center' }}>
              {orderError}
            </div>
          )}

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.5 }}>
            Payment is arranged directly with the dealership (M-Pesa / Bank Transfer) upon order confirmation.
          </div>
        </div>

      </form>

    </div>
  );
};
