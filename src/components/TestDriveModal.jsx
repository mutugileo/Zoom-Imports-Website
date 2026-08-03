import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useFocusTrap } from '@shared/lib/useFocusTrap';
import { Img } from './Img';
import { setScrollLocked } from '../lib/useLenis';
import { X, CheckCircle, CalendarClock } from 'lucide-react';

export const TestDriveModal = () => {
  const { isTestDriveOpen, setIsTestDriveOpen, testDriveTargetVehicle, submitEnquiry } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const closeRef = useRef(null);

  const close = useCallback(() => {

  // Focus goes in on open and back to the trigger on close.
  const trapRef = useFocusTrap(isTestDriveOpen);
    setIsTestDriveOpen(false);
    setSubmitted(false);
    setName('');
    setPhone('');
    setPreferredDate('');
  }, [setIsTestDriveOpen]);

  useEffect(() => {
    if (!isTestDriveOpen) return undefined;
    setScrollLocked(true);
    closeRef.current?.focus();
    return () => setScrollLocked(false);
  }, [isTestDriveOpen]);

  useEffect(() => {
    if (!isTestDriveOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isTestDriveOpen, close]);

  if (!isTestDriveOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    submitEnquiry({
      name: name.trim(),
      phone: phone.trim(),
      // The date the visitor picked has to reach the sales team, not vanish.
      preferredDate,
      vehicleName: testDriveTargetVehicle
        ? `${testDriveTargetVehicle.name} (${testDriveTargetVehicle.year})`
        : 'General vehicle request',
      type: 'Test Drive Request',
    });

    setSubmitted(true);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      className="modal-overlay"
      onClick={close}
      ref={trapRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Book a viewing"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', gap: '16px' }}>
          <div>
            <div className="mono" style={{ color: 'var(--accent)', marginBottom: '6px' }}>
              Mombasa Road showroom
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-3xl)', color: 'var(--text-dark)', lineHeight: 1.15 }}>
              Book a viewing
            </h2>
          </div>
          <button
            ref={closeRef}
            onClick={close}
            aria-label="Close"
            style={{
              background: 'var(--bg-cream)', border: 'none', borderRadius: '999px',
              width: '34px', height: '34px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <X size={16} color="var(--text-muted)" />
          </button>
        </div>

        {testDriveTargetVehicle && (
          <div
            style={{
              display: 'flex', gap: '14px', alignItems: 'center', background: 'var(--bg-cream)',
              padding: '12px 14px', borderRadius: '10px', marginBottom: '22px',
            }}
          >
            <div style={{ width: '72px', height: '54px', borderRadius: '7px', overflow: 'hidden', flexShrink: 0 }}>
              <Img src={testDriveTargetVehicle.img} alt={testDriveTargetVehicle.name} sizes="72px" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-dark)' }}>
                {testDriveTargetVehicle.name}
              </div>
              <div className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '3px' }}>
                {testDriveTargetVehicle.chassis} · grade {testDriveTargetVehicle.grade}
              </div>
            </div>
          </div>
        )}

        {submitted ? (
          <div style={{ padding: '26px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '13px', textAlign: 'center' }}>
            <CheckCircle size={44} color="var(--primary)" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--text-dark)' }}>
              Viewing requested
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: '42ch', lineHeight: 1.6 }}>
              Thanks {name.trim().split(' ')[0]}. We will call {phone.trim()} to confirm
              {preferredDate ? ` your ${new Date(preferredDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} slot` : ' a time that works'}.
            </p>
            <button onClick={close} className="btn-secondary" style={{ marginTop: '4px' }}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="field-label" htmlFor="td-name">Full name</label>
              <input
                id="td-name" type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Wanjiru"
                className="field"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="td-phone">Phone (WhatsApp preferred)</label>
              <input
                id="td-phone" type="tel" required value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +254 722 000 000"
                className="field"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="td-date">Preferred date</label>
              <input
                id="td-date" type="date" value={preferredDate} min={today}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="field"
              />
              <div className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', marginTop: '6px' }}>
                Viewings run Mon–Sat, 8:00–18:00
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '13px', marginTop: '4px' }}>
              <CalendarClock size={16} /> Request this viewing
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
