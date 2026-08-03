/**
 * Props that make a whole card operable by keyboard as well as mouse.
 *
 * Now that views have real URLs, the card takes a real `href`. That is not
 * cosmetic: it restores middle-click and ⌘-click to open a listing in a new tab,
 * shows the destination on hover, lets someone copy the link from the context
 * menu, and gives a crawler something to follow. A car listing that cannot be
 * opened in a new tab is a broken car listing.
 *
 * The click handler still runs so navigation stays client-side; the default is
 * prevented only for a plain left click, leaving modified clicks to the browser.
 *
 * Without an href it falls back to the previous role="link" + tabIndex pair, so
 * a card for a record with no route still works.
 */
export const clickableCard = (onOpen, label, href = null) => {
  if (!href) {
    return {
      role: 'link',
      tabIndex: 0,
      'aria-label': label,
      onClick: onOpen,
      onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      },
    };
  }

  return {
    href,
    'aria-label': label,
    onClick: (e) => {
      // Let the browser own new-tab, new-window and download intents.
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      onOpen();
    },
  };
};
