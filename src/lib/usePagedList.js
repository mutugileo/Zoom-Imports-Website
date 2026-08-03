import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Paging for a filtered list.
 *
 * Two things have to hold that a plain `useState(1)` does not give you:
 *
 *  - narrowing the filters resets to page one, because a visitor sitting on
 *    page three who ticks "hide sold" must not be handed an empty grid;
 *  - the page in effect is clamped during render, not in an effect afterwards,
 *    so a list that shrinks never paints a blank frame first.
 *
 * `resetKey` is any value that changes when the filter set changes — a joined
 * string of the filter state is the usual thing to pass.
 */
export const usePagedList = (items, pageSize, resetKey) => {
  const [requestedPage, setRequestedPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(requestedPage, pageCount);

  // Skips the first run: on mount the page is already 1, and resetting there
  // would fight a page restored from anywhere else later.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setRequestedPage(1);
  }, [resetKey]);

  // Keep state in step with the clamp above, so the next filter change starts
  // from the page the visitor can actually see.
  useEffect(() => {
    if (requestedPage !== page) setRequestedPage(page);
  }, [requestedPage, page]);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  const from = items.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(items.length, page * pageSize);

  return { page, pageCount, pageItems, setPage: setRequestedPage, from, to, total: items.length };
};

/**
 * Returns [ref, scrollToIt]. Changing page while looking at the bottom of a
 * grid would otherwise leave you at the foot of a fresh set of cards, reading
 * upwards. Goes through Lenis when it is running so the jump does not fight
 * the smooth-scroll loop.
 */
export const useScrollToRef = (offset = 90) => {
  const ref = useRef(null);

  const scrollToRef = useCallback(() => {
    const node = ref.current;
    if (!node) return;

    const lenis = window.__lenis;
    if (lenis) {
      lenis.scrollTo(node, { offset: -offset });
      return;
    }

    const top = node.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }, [offset]);

  return [ref, scrollToRef];
};
