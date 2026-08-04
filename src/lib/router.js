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
export const routeFromPath = (pathname, { vehicles = [], parts = [], ready = true } = {}) => {
  const path = normalise(pathname);
  const blank = { view: 'not-found', vehicleId: null, partId: null, vehicleSlug: null, partSlug: null };

  if (STATIC[path]) return { ...blank, view: STATIC[path] };

  const vehicleMatch = path.match(/^\/vehicles\/(.+)$/);
  if (vehicleMatch) {
    const vehicle = findBySlug(vehicles, vehicleMatch[1]);
    if (vehicle) return { ...blank, view: 'vehicle-detail', vehicleId: vehicle.id };
    /* The catalogue now arrives over the network, so "no match" at first paint
       means "not here yet", not "no such car". Declaring 404 on an unresolved
       slug would flash a dead end on every shared link before the fetch lands.
       The slug is carried instead, and resolved once the data is in. */
    if (!ready) return { ...blank, view: 'vehicle-detail', vehicleSlug: vehicleMatch[1] };
    return blank;
  }

  const partMatch = path.match(/^\/parts\/(.+)$/);
  if (partMatch) {
    const part = findBySlug(parts, partMatch[1]);
    if (part) return { ...blank, view: 'part-detail', partId: part.id };
    if (!ready) return { ...blank, view: 'part-detail', partSlug: partMatch[1] };
    return blank;
  }

  return blank;
};

/** Slug → id, for a deep link whose catalogue arrived after the first paint. */
export const idForSlug = (list, slug) => findBySlug(list, slug)?.id ?? null;

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

/** Per-view document titles optimized for Mazda vehicles and Mazda spare parts SEO. */
export const titleFor = (view, record) => {
  const base = 'Zoom Imports — Mazda Specialist Nairobi';
  switch (view) {
    case 'home': return `Zoom Imports — Dedicated Mazda Import Dealership & Genuine OEM Parts Nairobi`;
    case 'vehicles': return `Mazda Vehicles for Sale in Kenya — Demio, CX-5, Axio, Atenza, CX-30 | Zoom Imports`;
    case 'parts': return `Genuine OEM Mazda Spare Parts Nairobi, Kenya — Engine, Suspension & Brakes | Zoom Imports`;
    case 'about': return `About Zoom Imports — Kenya's Premier Dedicated Mazda Specialist | Nairobi`;
    case 'contact': return `Contact Zoom Imports — Mazda Vehicle Showroom & Parts Counter K-Mall, Kiambu Rd, Thindigua`;
    case 'checkout': return `Checkout — Genuine Mazda Spare Parts Order | Zoom Imports Nairobi`;
    case 'sell': return `List Your Mazda Vehicle With Us — Mazda Import Specialist | Zoom Imports`;
    case 'sell-parts': return `Supply Genuine Mazda Spare Parts — Zoom Imports Nairobi`;
    case 'not-found': return `Page Not Found — Zoom Imports Mazda Specialist`;
    case 'vehicle-detail':
      return record ? `${record.year ? record.year + ' ' : ''}${record.name} for Sale in Nairobi — Mazda Specialist | Zoom Imports` : base;
    case 'part-detail':
      return record ? `Genuine ${record.name} (${record.brand || 'Mazda OEM'}) for Mazda — Zoom Imports` : base;
    default: return base;
  }
};

/** Per-view meta description generator for dynamic SEO optimization. */
export const descriptionFor = (view, record) => {
  const base = "Nairobi's dedicated Mazda import vehicle dealership and genuine OEM Mazda spare parts specialist on K-Mall, Kiambu Rd, Thindigua.";
  switch (view) {
    case 'home':
      return `Kenya's premier dedicated Mazda specialist on K-Mall, Kiambu Rd, Thindigua, Kiambu. Certified Mazda Demio, CX-5, Axio, Atenza, CX-30, Premacy, Biante & genuine OEM Mazda spare parts.`;
    case 'vehicles':
      return `Explore verified Mazda vehicles imported directly from Japan. Mazda Demio, CX-5, Axio, Atenza, CX-30, Biante & Premacy available for sale in Nairobi with full documentation.`;
    case 'parts':
      return `Buy 100% genuine OEM Mazda spare parts in Nairobi. Fast delivery across Kenya for Mazda Demio, CX-5, Axio, Atenza, CX-30, Premacy, Biante, BT-50 engine, suspension & body parts.`;
    case 'about':
      return `Learn about Zoom Imports — Nairobi's dedicated Mazda vehicle importer & genuine spare parts counter. USS auction certified, JEVIC odometer verified, based on K-Mall, Kiambu Rd, Thindigua.`;
    case 'contact':
      return `Get in touch with Zoom Imports on K-Mall, Kiambu Rd, Thindigua, Kiambu. Contact our Mazda vehicle sales desk or genuine Mazda spare parts counter for inquiries and orders.`;
    case 'vehicle-detail':
      return record ? `Buy this inspected ${record.year || ''} ${record.name} at Zoom Imports Nairobi. ${record.mileage ? record.mileage + ' km, ' : ''}${record.engine || ''}, ${record.trans || ''}. Certified Mazda import.` : base;
    case 'part-detail':
      return record ? `Order genuine ${record.name} (${record.brand || 'Mazda Genuine'}) at Zoom Imports. ${record.description || ''} Fits ${record.compat || 'Mazda vehicles'}.` : base;
    default:
      return base;
  }
};
