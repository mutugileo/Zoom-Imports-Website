/**
 * URL routing.
 *
 * The app previously navigated by setting a state variable, which meant one URL
 * for the whole site: a vehicle could not be linked to, the back button left the
 * site, a refresh returned you to the homepage, and a crawler saw a single page.
 * For a dealership where stock gets shared over WhatsApp, the link *is* the
 * product page.
 *
 * Deliberately hand-rolled rather than pulling in a router. There are eight
 * routes and two of them take a parameter; the History API covers that in fewer
 * lines than the integration would take, and it keeps the dependency list at
 * four. If nested layouts or loaders ever appear, swap this for React Router —
 * every call site already goes through `pathFor` and `routeFromPath`.
 */

export const slugify = (value) =>
  String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Slugs must be stable and unique or two cars fight over one URL.
 *
 * A record's own `slug` wins when it has one. Otherwise it is derived, and a
 * collision falls back to appending the id rather than a positional counter —
 * a counter would reshuffle every URL as soon as stock is added or removed.
 */
export const slugFor = (item, all = []) => {
  if (!item) return '';
  if (item.slug) return item.slug;
  const base = slugify(`${item.name} ${item.year ?? ''}`);
  if (!base) return String(item.id);
  const clashes = all.filter(
    (other) => other !== item && !other.slug && slugify(`${other.name} ${other.year ?? ''}`) === base
  );
  return clashes.length ? `${base}-${item.id}` : base;
};

const findBySlug = (list, slug) =>
  list.find((item) => slugFor(item, list) === slug) ?? null;

/** Static routes, longest-lived first. Detail routes are handled separately. */
const STATIC = {
  '/': 'home',
  '/vehicles': 'vehicles',
  '/parts': 'parts',
  '/about': 'about',
  '/contact': 'contact',
  '/checkout': 'checkout',
  /* Two paths, one form. Which one you arrived on decides whether it opens
     asking about a car or about parts, and the URL stays honest about it so
     the link can be shared or advertised on its own. */
  '/sell': 'sell',
  '/sell-parts': 'sell-parts',
};

const VIEW_TO_PATH = Object.fromEntries(
  Object.entries(STATIC).map(([path, view]) => [view, path])
);

/** Trailing slashes and casing should not produce a 404. */
const normalise = (pathname) => {
  const trimmed = String(pathname || '/').replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed.toLowerCase();
};

/**
 * URL → app state. Returns `not-found` for an unknown path or a slug that
 * matches no record, so a dead link renders a 404 rather than silently showing
 * the homepage or the first vehicle in the list.
 */
export const routeFromPath = (pathname, { vehicles = [], parts = [] } = {}) => {
  const path = normalise(pathname);

  if (STATIC[path]) return { view: STATIC[path], vehicleId: null, partId: null };

  const vehicleMatch = path.match(/^\/vehicles\/(.+)$/);
  if (vehicleMatch) {
    const vehicle = findBySlug(vehicles, vehicleMatch[1]);
    return vehicle
      ? { view: 'vehicle-detail', vehicleId: vehicle.id, partId: null }
      : { view: 'not-found', vehicleId: null, partId: null };
  }

  const partMatch = path.match(/^\/parts\/(.+)$/);
  if (partMatch) {
    const part = findBySlug(parts, partMatch[1]);
    return part
      ? { view: 'part-detail', vehicleId: null, partId: part.id }
      : { view: 'not-found', vehicleId: null, partId: null };
  }

  return { view: 'not-found', vehicleId: null, partId: null };
};

/**
 * App state → URL. Falls back to the listing page when a detail view is asked
 * for without a resolvable record, so we never push a URL that would 404 on
 * reload.
 */
export const pathFor = (view, { id = null, vehicles = [], parts = [] } = {}) => {
  if (view === 'vehicle-detail') {
    const vehicle = vehicles.find((v) => v.id === id);
    return vehicle ? `/vehicles/${slugFor(vehicle, vehicles)}` : '/vehicles';
  }
  if (view === 'part-detail') {
    const part = parts.find((p) => p.id === id);
    return part ? `/parts/${slugFor(part, parts)}` : '/parts';
  }
  return VIEW_TO_PATH[view] ?? '/';
};

/** Per-view document titles, so history entries and tabs are distinguishable. */
export const titleFor = (view, record) => {
  const base = 'Zoom Imports';
  switch (view) {
    case 'home': return `${base} — Mazda imports & genuine parts, Nairobi`;
    case 'vehicles': return `Vehicles — ${base}`;
    case 'parts': return `Spare parts — ${base}`;
    case 'about': return `About — ${base}`;
    case 'contact': return `Contact — ${base}`;
    case 'checkout': return `Checkout — ${base}`;
    case 'sell': return `List your car with us — ${base}`;
    case 'sell-parts': return `List your parts with us — ${base}`;
    case 'not-found': return `Page not found — ${base}`;
    case 'vehicle-detail':
    case 'part-detail':
      return record ? `${record.name} — ${base}` : base;
    default: return base;
  }
};
