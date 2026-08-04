/**
 * Postgres row → the shape the storefront renders.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * This is deliberately a SMALLER file than the admin's copy, and the difference
 * is the point. There is no mapper here for the cost ledger, the sale record,
 * the part buy price or the order cost snapshot — not because the storefront
 * has no use for them, but because a mapper is an invitation. The moment one
 * exists, some future screen imports it and the dealership's buying position is
 * one fetch from every visitor.
 *
 * RLS is what actually stops those tables being read by the public key; this
 * file simply gives no one the vocabulary to try. scripts/check-leaks.mjs fails
 * the build if the internal field names ever appear in the shipped bundle.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const vehicleFromRow = (r) => ({
  id: r.id,
  name: r.name,
  stockId: r.stock_id,
  stage: r.stage,
  groupId: r.group_id || '',
  regNumber: r.reg_number || '',
  location: r.location || '',
  tags: r.tags || [],
  listing: r.listing,
  make: r.make,
  year: r.year,
  // Numeric arrives from PostgREST as a string so precision survives the wire;
  // every price format and comparison downstream expects a number.
  price: r.price == null ? null : Number(r.price),
  mileage: r.mileage,
  fuel: r.fuel,
  trans: r.trans,
  engine: r.engine,
  body: r.body,
  color: r.color,
  condition: r.condition,
  status: r.status,
  featured: !!r.featured,
  img: r.img,
  images: r.images || [],
  description: r.description,
  slug: r.slug,
  chassis: r.chassis,
  grade: r.grade,
  inspection: r.inspection,
  odometerVerified: !!r.odometer_verified,
  dutyPaid: !!r.duty_paid,
  port: r.port,
});

export const partFromRow = (r) => ({
  id: r.id,
  name: r.name,
  brand: r.brand,
  category: r.category,
  price: r.price == null ? null : Number(r.price),
  promo: r.promo == null ? null : Number(r.promo),
  compat: r.compat,
  stock: r.stock,
  img: r.img,
  description: r.description,
  sku: r.sku,
  partNumber: r.part_number || '',
});

export const compatFromRow = (r) => ({
  id: r.id,
  partId: r.part_id,
  part: r.part_name_legacy,
  brand: r.brand,
  make: r.make,
  model: r.model_legacy,
  years: r.years,
});

export const reviewFromRow = (r) => ({
  id: r.id,
  name: r.name,
  role: r.role,
  quote: r.quote,
  rating: r.rating,
  status: r.status,
});

/**
 * Checkout. `items` carries the structured lines so the yard can work out what
 * the order earned later — the customer app supplies quantities and the prices
 * it charged, and nothing about what any of it cost to buy.
 */
export const orderToRow = (o) => ({
  ref: o.ref,
  customer: o.customer,
  phone: o.phone,
  email: o.email,
  location: o.location,
  items: o.items,
  items_fmt: o.itemsFmt,
  total: o.total,
  status: o.status,
  delivery: o.delivery,
  order_date: o.date,
});

export const enquiryToRow = (e) => ({
  customer: e.customer,
  phone: e.phone,
  vehicle: e.vehicle,
  type: e.type,
  status: e.status,
  enquiry_date: e.date,
});

export const reviewToRow = (r) => ({
  name: r.name,
  role: r.role,
  quote: r.quote,
  rating: r.rating,
  // Never trusted from the client: the insert policy also enforces Pending, so
  // a tampered payload is refused by Postgres rather than merely by this line.
  status: 'Pending',
});
