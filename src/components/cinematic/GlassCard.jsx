import React from 'react';

/**
 * Effect 5 — Glass cards.
 *
 * Frosted panels for content that floats over imagery. Only for use on dark
 * or photographic grounds; on the cream surfaces a plain card is correct and
 * glass just looks muddy.
 */
export const GlassCard = ({ children, style, tone = 'dark', className = '', ...rest }) => {
  const tones = {
    dark: {
      // 0.55 looked right but measured 2.90:1 for the accent label over a
      // bright photo. 0.74 clears AA and still reads as frosted glass.
      // rgb(30,52,73) is --ink-raised; it was still the retired green-black
      // rgb(18,32,27), which is why the dossier read warm against the navy hero.
      background: 'rgba(30, 52, 73, 0.74)',
      border: '1px solid rgba(255, 255, 255, 0.16)',
      color: '#eef2f7',
      boxShadow: '0 20px 50px -24px rgba(0,0,0,0.6)',
    },
    light: {
      background: 'rgba(251, 250, 248, 0.72)',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      color: '#16232e',
      boxShadow: '0 20px 50px -28px rgba(16,28,42,0.4)',
    },
  };

  return (
    <div
      className={`glass ${className}`.trim()}
      style={{
        /* Light, not frosted. At blur(14px) the vehicle behind the dossier
           dissolved into coloured fog — on the hero that is the *car being
           sold*, and burying it to decorate a panel gets the priority backwards.
           3px still separates the panel from the photo without hiding what is
           underneath. Text contrast is unaffected either way: it comes from the
           0.74 fill below, which is the value that was measured for AA. */
        backdropFilter: 'blur(3px) saturate(1.15)',
        WebkitBackdropFilter: 'blur(3px) saturate(1.15)',
        borderRadius: '14px',
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};
