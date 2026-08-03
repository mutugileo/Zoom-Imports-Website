import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A brief "Added" state on a buy button.
 *
 * The cart drawer used to fly open on every add, which was the confirmation.
 * Now that it stays shut, the button has to say so itself — otherwise a click
 * with a full basket already in the header reads as having done nothing.
 *
 * The timer is stored so a second click restarts it rather than letting the
 * first one switch the label back while the shopper is still adding.
 */
export const useAddedFlash = (ms = 1700) => {
  const [added, setAdded] = useState(false);
  const timer = useRef(null);

  const confirm = useCallback(() => {
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), ms);
  }, [ms]);

  // A card can be unmounted mid-flash by paging or filtering the grid.
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return [added, confirm];
};
