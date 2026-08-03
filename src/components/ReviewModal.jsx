import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useFocusTrap } from '@shared/lib/useFocusTrap';
import { setScrollLocked } from '../lib/useLenis';
import { X, Star, CheckCircle, Send } from 'lucide-react';

const MIN_QUOTE = 20;
const MAX_QUOTE = 400;

export const ReviewModal = () => {
  const { isReviewOpen, setIsReviewOpen, submitReview } = useApp();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const closeRef = useRef(null);

  // Focus goes in on open and back to the trigger on close. Hooks must stay at
  // component scope; putting this inside `close` left `trapRef` undefined when
  // the dialog rendered and made the button crash the review flow.
  const trapRef = useFocusTrap(isReviewOpen);

  const close = useCallback(() => {
    setIsReviewOpen(false);
    setSubmitted(false);
    setName('');
    setRole('');
    setQuote('');
    setRating(5);
  }, [setIsReviewOpen]);

  useEffect(() => {
    if (!isReviewOpen) return undefined;
    setScrollLocked(true);
    closeRef.current?.focus();
    return () => setScrollLocked(false);
  }, [isReviewOpen]);

  useEffect(() => {
    if (!isReviewOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isReviewOpen, close]);

  if (!isReviewOpen) return null;

  const tooShort = quote.trim().length > 0 && quote.trim().length < MIN_QUOTE;
  const canSubmit = name.trim() && quote.trim().length >= MIN_QUOTE;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    submitReview({ name, role, quote, rating });
    setSubmitted(true);
  };

  const shown = hoverRating || rating;

  return (
    <div
      className="modal-overlay"
      onClick={close}
      ref={trapRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Write a review"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', gap: '16px' }}>
          <div>
            <div className="mono" style={{ color: 'var(--accent)', marginBottom: '6px' }}>
              Your experience
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 'var(--text-3xl)', color: 'var(--text-dark)', lineHeight: 1.15 }}>
              Write a review
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

        {submitted ? (
          <div style={{ padding: '22px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '13px', textAlign: 'center' }}>
            <CheckCircle size={44} color="var(--primary)" />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--text-dark)' }}>
              Thanks, {name.trim().split(' ')[0]}
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: '44ch', lineHeight: 1.65 }}>
              Your review has been sent to the team. We read every one before it goes up on
              the site, so it will not appear straight away.
            </p>
            <button onClick={close} className="btn-secondary" style={{ marginTop: '4px' }}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <fieldset style={{ border: 'none' }}>
              <legend className="field-label" style={{ marginBottom: '8px' }}>How did we do?</legend>
              <div style={{ display: 'flex', gap: '4px' }} onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    aria-label={`${n} star${n === 1 ? '' : 's'}`}
                    aria-pressed={rating === n}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                      display: 'flex', lineHeight: 0,
                    }}
                  >
                    <Star
                      size={26}
                      strokeWidth={1.5}
                      color={n <= shown ? '#c9922f' : 'var(--border-medium)'}
                      fill={n <= shown ? '#e8b355' : 'transparent'}
                    />
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="field-label" htmlFor="rv-name">Your name</label>
              <input
                id="rv-name" type="text" required value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. James Mburu"
                className="field"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="rv-role">What did you buy? (optional)</label>
              <input
                id="rv-role" type="text" value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Mazda Axela buyer"
                className="field"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="rv-quote">Your review</label>
              <textarea
                id="rv-quote" rows="4" required value={quote}
                maxLength={MAX_QUOTE}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="What stood out? The paperwork, the condition, how we handled it…"
                className="field"
                style={{ resize: 'vertical' }}
              />
              <div
                className="mono"
                style={{
                  display: 'flex', justifyContent: 'space-between', gap: '10px',
                  fontSize: 'var(--text-xs)', marginTop: '6px',
                  color: tooShort ? '#a13f3f' : 'var(--text-muted)',
                }}
              >
                <span>{tooShort ? `A little more detail — ${MIN_QUOTE - quote.trim().length} characters to go` : 'Be specific, it helps other buyers'}</span>
                <span>{quote.length}/{MAX_QUOTE}</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={!canSubmit}
              style={{ padding: '13px', marginTop: '4px', opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
            >
              <Send size={15} /> Send review
            </button>

            <p className="mono" style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center' }}>
              Reviews are checked before they appear on the site
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
