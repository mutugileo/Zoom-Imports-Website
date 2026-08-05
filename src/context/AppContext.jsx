import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { formatKES, formatDate } from '@shared/lib/format';
import { KEYS, read, write, makeOrderRef } from '@shared/lib/store';
import { supabase } from '@shared/lib/supabaseClient';
import { friendlyError } from '@shared/lib/friendlyError';
import {
  vehicleFromRow, partFromRow, compatFromRow, reviewFromRow,
  orderToRow, enquiryToRow, reviewToRow,
} from '@shared/lib/dbMap';
import { routeFromPath, pathFor, titleFor, descriptionFor, idForSlug } from '../lib/router';

/**
 * Customer-facing state only.
 *
 * The catalogue, the contact details, the banners, the FAQs and the published
 * reviews are all read from Supabase — the same rows the admin portal writes.
 * Nothing on this surface falls back to bundled sample data: an empty database
 * renders an empty showroom, which is the truth, rather than demo cars nobody
 * can buy.
 *
 * The shop READS the catalogue and never edits it. What it does write is what a
 * customer creates: an order, an enquiry, a review. Those go in under an
 * insert-only policy, so a shopper can submit but can never read back the order
 * book. Only the cart stays in browser storage, because a half-filled basket is
 * this browser's business and nobody else's.
 */

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  /**
   * The URL is the source of truth for which view is showing.
   *
   * The view is resolved before paint so a deep link never flashes the
   * homepage. The record behind a detail slug cannot be — it is a fetch away —
   * so the slug is carried and resolved when the catalogue lands.
   */
  // Optional chaining, not a `typeof window` guard: a non-browser host can
  // supply a partial window, and reading .pathname off it throws during render.
  // `ready: false` — the catalogue is a fetch away, so a detail slug is held
  // rather than resolved here (see routeFromPath).
  const initialRoute = routeFromPath(
    (typeof window === 'undefined' ? null : window.location?.pathname) ?? '/',
    { ready: false }
  );

  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialRoute.vehicleId ?? null);
  const [selectedPartId, setSelectedPartId] = useState(initialRoute.partId ?? null);
  // Slugs from a deep link, waiting for the catalogue to land.
  const [pendingVehicleSlug, setPendingVehicleSlug] = useState(initialRoute.vehicleSlug ?? null);
  const [pendingPartSlug, setPendingPartSlug] = useState(initialRoute.partSlug ?? null);

  const [pageTransition, setPageTransition] = useState('none'); // 'none' | 'reveal-detail' | 'zoom-back' | 'zoom-back-grid'
  const [returningVehicleId, setReturningVehicleId] = useState(null);
  const [returningPartId, setReturningPartId] = useState(null);
  const [previousView, setPreviousView] = useState('vehicles');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState(null);
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [testDriveTargetVehicle, setTestDriveTargetVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Catalogue — read-only on this surface.
   *
   * `catalogueError` is kept separate from "no rows" on purpose: a failed fetch
   * and a yard with nothing in it must not read the same to a customer.
   */
  const [vehicles, setVehicles] = useState([]);
  const [parts, setParts] = useState([]);
  const [compatibility, setCompatibility] = useState([]);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState(null);

  /**
   * Contact details, from the same record the admin portal's Site Content
   * screen writes.
   *
   * They were hardcoded in eight places across the header, footer, contact
   * page and every WhatsApp link — so the screen that exists to edit them
   * changed nothing, and the site disagreed with itself. Now there is one row
   * in Postgres and one read of it.
   *
   * `waNumber` is the phone with everything but the digits taken out, because
   * wa.me will not accept spaces or a plus sign.
   */
  const EMPTY_CONTACT = { phone: '', whatsapp: '', email: '', location: '', hours: '', facebook: '', instagram: '' };

  /* Painted from the last known copy, then revalidated.
   *
   * These sit in the header rail and the footer, which render before any fetch
   * can land. Starting them blank made the bar paint empty and then pop the
   * phone number and opening hours in a few hundred milliseconds later — a
   * visible flicker on every page load, and one this app caused by moving the
   * details into Postgres. They change perhaps twice a year, so the honest
   * trade is to show the last copy immediately and correct it silently when
   * the real row arrives. */
  const [contact, setContact] = useState(() => ({ ...EMPTY_CONTACT, ...read(KEYS.siteContact, {}) }));
  const [banners, setBanners] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const waNumber = String(contact.whatsapp || contact.phone || '').replace(/\D/g, '');

  /**
   * One fetch for everything the storefront paints with.
   *
   * Run together rather than in sequence: they are independent tables and a
   * waterfall would add a round trip per section for no benefit. The catalogue
   * decides the loading and error state because it is what the listing pages
   * are actually waiting on — a missing FAQ should not stop a car being shown.
   */
  const loadSiteData = useCallback(async () => {
    setCatalogueLoading(true);
    setCatalogueError(null);

    const [vehRes, partRes, compatRes, contactRes, bannerRes, faqRes, reviewRes] = await Promise.all([
      supabase.from('vehicles').select('*').order('id'),
      supabase.from('parts').select('*').order('id'),
      supabase.from('compatibility_rules').select('*').order('id'),
      supabase.from('site_contact').select('*').eq('id', 1).maybeSingle(),
      supabase.from('site_banners').select('*').order('created_at'),
      supabase.from('site_faqs').select('*').order('created_at'),
      supabase.from('site_reviews').select('*').order('created_at', { ascending: false }),
    ]);

    setCatalogueLoading(false);

    if (vehRes.error || partRes.error) {
      // Says what happened instead of rendering an empty showroom — a network
      // failure and a yard with no cars must not look the same to a customer.
      setCatalogueError(friendlyError(vehRes.error ?? partRes.error, 'Could not load the catalogue. Check your connection and try again.'));
      return;
    }

    setVehicles((vehRes.data ?? []).map(vehicleFromRow));
    setParts((partRes.data ?? []).map(partFromRow));
    if (!compatRes.error) setCompatibility((compatRes.data ?? []).map(compatFromRow));
    if (!contactRes.error && contactRes.data) {
      const next = { ...EMPTY_CONTACT, ...contactRes.data };
      setContact(next);
      write(KEYS.siteContact, next);   // seeds the next visit's first paint
    }
    if (!bannerRes.error) setBanners(bannerRes.data ?? []);
    if (!faqRes.error) setFaqs(faqRes.data ?? []);
    // RLS already filters to Published; the guard is here too so a policy
    // change can never quietly put an unapproved review on the homepage.
    if (!reviewRes.error) setReviews((reviewRes.data ?? []).map(reviewFromRow).filter((r) => r.status === 'Published'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadSiteData(); }, [loadSiteData]);

  const retryCatalogue = useCallback(() => { loadSiteData(); }, [loadSiteData]);

  /* The one thing that genuinely belongs to this browser. A basket someone is
     still filling is not the dealership's record of anything, and putting it in
     Postgres would mean writing a row on every click. */
  const [cart, setCart] = useState(() => read(KEYS.cart, []));
  useEffect(() => { write(KEYS.cart, cart); }, [cart]);

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  /**
   * A shared link, resolved once the catalogue arrives.
   *
   * The slug was held rather than 404'd at first paint. Now the data is in,
   * either it names a real record or it genuinely does not exist — and only
   * now is `not-found` the honest answer.
   */
  useEffect(() => {
    if (catalogueLoading) return;
    if (pendingVehicleSlug) {
      const id = idForSlug(vehicles, pendingVehicleSlug);
      setPendingVehicleSlug(null);
      if (id != null) setSelectedVehicleId(id); else setCurrentView('not-found');
    }
    if (pendingPartSlug) {
      const id = idForSlug(parts, pendingPartSlug);
      setPendingPartSlug(null);
      if (id != null) setSelectedPartId(id); else setCurrentView('not-found');
    }
  }, [catalogueLoading, pendingVehicleSlug, pendingPartSlug, vehicles, parts]);

  const applyRoute = useCallback((route) => {
    if (route.vehicleId != null) setSelectedVehicleId(route.vehicleId);
    if (route.partId != null) setSelectedPartId(route.partId);
    setCurrentView(route.view);
  }, []);

  const navigateTo = useCallback((view, payloadId = null) => {
    if ((view === 'vehicle-detail' || view === 'part-detail') && payloadId != null) {
      const isPart = view === 'part-detail';
      setPreviousView(
        currentView === 'vehicle-detail' || currentView === 'part-detail'
          ? (isPart ? 'parts' : 'vehicles')
          : currentView
      );
      if (isPart) {
        setSelectedPartId(payloadId);
        setReturningPartId(null);
      } else {
        setSelectedVehicleId(payloadId);
        setReturningVehicleId(null);
      }
      setPageTransition('reveal-detail');
      setTimeout(() => setPageTransition('none'), 550);
    } else if (payloadId != null && view === 'vehicle-detail') {
      setSelectedVehicleId(payloadId);
    } else if (payloadId != null && view === 'part-detail') {
      setSelectedPartId(payloadId);
    }

    setCurrentView(view);

    const path = pathFor(view, { id: payloadId, vehicles, parts });
    // Re-clicking the current link should not stack duplicate history entries.
    if (path !== window.location.pathname) {
      window.history.pushState({ view, id: payloadId }, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, vehicles, parts]);

  const navigateBackFromDetail = useCallback((targetView = null) => {
    const isPart = currentView === 'part-detail';
    const nextView = targetView || previousView || (isPart ? 'parts' : 'vehicles');
    const activeVehicleId = selectedVehicleId;
    const activePartId = selectedPartId;

    // 1. Trigger exit zoom animation on detail page
    setPageTransition('zoom-back');
    if (isPart) {
      setReturningPartId(activePartId);
    } else {
      setReturningVehicleId(activeVehicleId);
    }

    // 2. Wait for exit zoom animation to complete
    setTimeout(() => {
      setCurrentView(nextView);
      setPageTransition('zoom-back-grid');

      const path = pathFor(nextView, { vehicles, parts });
      if (path !== window.location.pathname) {
        window.history.pushState({ view: nextView }, '', path);
      }

      // 3. Scroll to selected item card & trigger pulse zoom
      setTimeout(() => {
        const selector = isPart
          ? `[data-part-id="${activePartId}"]`
          : `[data-vehicle-id="${activeVehicleId}"]`;
        const targetEl = document.querySelector(selector);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);

      // 4. Reset transition after returning animation
      setTimeout(() => {
        setPageTransition('none');
        setReturningVehicleId(null);
        setReturningPartId(null);
      }, 1000);
    }, 380);
  }, [currentView, previousView, selectedVehicleId, selectedPartId, vehicles, parts]);

  /**
   * Back and forward. Without this the browser would change the URL while the
   * app kept rendering the old view — worse than having no routing at all.
   */
  useEffect(() => {
    const onPop = () => {
      const route = routeFromPath(window.location.pathname, { vehicles, parts });
      if ((currentView === 'vehicle-detail' || currentView === 'part-detail') && route.view !== currentView) {
        navigateBackFromDetail(route.view);
      } else {
        applyRoute(route);
        window.scrollTo({ top: 0 });
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [applyRoute, currentView, navigateBackFromDetail, vehicles, parts]);

  /** Distinguishable tab, history-entry titles and meta descriptions for SEO. */
  useEffect(() => {
    const record =
      currentView === 'vehicle-detail' ? vehicles.find((v) => v.id === selectedVehicleId)
      : currentView === 'part-detail' ? parts.find((p) => p.id === selectedPartId)
      : null;
    document.title = titleFor(currentView, record);

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', descriptionFor(currentView, record));
  }, [currentView, selectedVehicleId, selectedPartId, vehicles, parts]);

  /**
   * Adds to the basket and stays where it is.
   *
   * Deliberately does NOT open the drawer. Someone buying a brake kit is
   * usually buying pads, discs and fluid in one pass, and a panel that throws
   * itself over the catalogue after every click makes that a fight — each add
   * costs a dismiss before the next one. The cart opens when the shopper opens
   * it.
   *
   * The count in the header is the standing signal; `cartNotice` carries the
   * one-off announcement for screen readers, which otherwise get nothing at all
   * now that no dialog appears.
   */
  const addToCart = useCallback((partItem, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === partItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === partItem.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [
        ...prev,
        {
          id: partItem.id,
          name: partItem.name,
          price: partItem.promo || partItem.price,
          qty,
          img: partItem.img,
          brand: partItem.brand,
        },
      ];
    });
    // Re-adding the same part must re-announce, so the message carries a nonce.
    setCartNotice({
      text: `${qty} × ${partItem.name} added to your cart`,
      at: Date.now(),
    });
  }, []);

  const updateCartQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        })
        .filter(Boolean)
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );
  const cartItemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const submitOrder = useCallback(
    async (customerDetails) => {
      /* The reference is minted from the clock, not from a count of existing
         orders — this app can no longer see the order book (insert-only), and
         a counter over a list it cannot read would collide the moment two
         customers checked out at once. */
      const newOrder = {
        ref: makeOrderRef([]),
        customer: customerDetails.name,
        phone: customerDetails.phone,
        email: customerDetails.email || 'N/A',
        location:
          customerDetails.delivery === 'Delivery'
            ? customerDetails.address
            : 'Dealership Pickup',
        /* Structured lines, so the order can be costed and its profit worked
           out later. `itemsFmt` stays as the display string every existing
           screen already renders — it is derived from the same array rather
           than being a second, drifting source of truth.

           No cost is written here on purpose: this is the customer app, and it
           has no business knowing what the yard paid. The admin snapshots cost
           against these lines when the order is marked Completed. */
        items: cart.map((i) => ({
          partId: i.id,
          name: i.name,
          qty: i.qty,
          unitPrice: i.promo || i.price,
        })),
        itemsFmt: cart.map((i) => `${i.name} ×${i.qty}`).join(', '),
        total: cartSubtotal,
        status: 'New',
        date: formatDate(),
        delivery: customerDetails.delivery,
      };

      /* `ref` is the primary key and is randomly generated, so two checkouts in
         the same instant can collide. A collision is retried with a fresh
         reference rather than shown to the customer as "that already exists",
         which would be both baffling and untrue of their order. */
      let attempt = { ...newOrder };
      for (let tries = 0; tries < 3; tries += 1) {
        const { error } = await supabase.from('orders').insert(orderToRow(attempt));
        if (!error) {
          clearCart();
          return { ok: true, order: attempt };
        }
        if (error.code !== '23505') {
          return { ok: false, reason: friendlyError(error, 'Could not place your order. Try again.') };
        }
        attempt = { ...attempt, ref: makeOrderRef([attempt.ref]) };
      }
      return { ok: false, reason: 'Could not place your order. Try again.' };
    },
    [cart, cartSubtotal, clearCart]
  );

  /**
   * A submitted review is held as 'Pending', not published.
   *
   * Anything a stranger types would otherwise appear verbatim on the homepage
   * of a real dealership. Reviews wait for someone to approve them; the
   * homepage only renders status === 'Published'.
   */
  const submitReview = useCallback(async (reviewData) => {
    const { error } = await supabase.from('site_reviews').insert(reviewToRow({
      name: reviewData.name.trim(),
      role: reviewData.role.trim() || 'Verified customer',
      quote: reviewData.quote.trim(),
      rating: reviewData.rating,
    }));
    if (error) return { ok: false, reason: friendlyError(error, 'Could not send your review. Try again.') };
    /* Deliberately not added to `reviews`: it is held for approval, and showing
       it back immediately would imply it is live on the site. */
    return { ok: true };
  }, []);

  // Already filtered on the way in — kept as a named value because every
  // caller reads it, and the name is the promise.
  const publishedReviews = reviews;

  /**
   * A seller's own listing, held for approval.
   *
   * Written as a real vehicle rather than an enquiry, so once the yard
   * approves it the car is already in the catalogue with its photographs —
   * nobody has to retype it. `Pending` and `source: 'public'` are enforced by
   * the insert policy as well as set here; the seller's name and number ride
   * in the description because there is nowhere else on a vehicle to put them
   * and the yard needs to be able to call them back.
   */
  const submitVehicleListing = useCallback(async (v) => {
    const slugBase = `${v.name} ${v.year ?? ''}`.toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const { error } = await supabase.from('vehicles').insert({
      name: v.name,
      year: v.year,
      price: v.price,
      mileage: v.mileage,
      trans: v.trans,
      fuel: v.fuel,
      color: v.color,
      reg_number: v.regNumber,
      make: 'Mazda',
      status: 'Available',
      listing: 'private',
      // Unique per submission: two sellers offering the same model must not
      // collide on the slug and have the second insert rejected.
      slug: `${slugBase}-${Date.now().toString(36)}`,
      img: v.images[0] ?? null,
      images: v.images,
      description: [v.description, `Listed by ${v.sellerName} · ${v.sellerPhone}`].filter(Boolean).join('\n\n'),
      approval_status: 'Pending',
      source: 'public',
    });
    if (error) return { ok: false, reason: friendlyError(error, 'Could not send your listing. Try again.') };
    return { ok: true };
  }, []);

  const submitPartListing = useCallback(async (p) => {
    const { error } = await supabase.from('parts').insert({
      name: p.name,
      brand: p.brand || null,
      price: p.price,
      stock: p.stock,
      compat: p.compat,
      img: p.images[0] ?? null,
      description: [p.description, `Offered by ${p.sellerName} · ${p.sellerPhone}`].filter(Boolean).join('\n\n'),
      approval_status: 'Pending',
      source: 'public',
    });
    if (error) return { ok: false, reason: friendlyError(error, 'Could not send your listing. Try again.') };
    return { ok: true };
  }, []);

  const submitEnquiry = useCallback(async (enquiryData) => {
    const { error } = await supabase.from('enquiries').insert(enquiryToRow({
      customer: enquiryData.name,
      phone: enquiryData.phone,
      vehicle: enquiryData.vehicleName || 'General Enquiry',
      type: enquiryData.type || 'Test Drive Request',
      status: 'New',
      date: formatDate(),
    }));
    if (error) return { ok: false, reason: friendlyError(error, 'Could not send your enquiry. Try again.') };
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      currentView,
      navigateTo,
      navigateBackFromDetail,
      pageTransition,
      returningVehicleId,
      returningPartId,
      catalogueError,
      retryCatalogue,
      selectedVehicleId,
      selectedPartId,
      searchQuery,
      setSearchQuery,

      vehicles,
      parts,
      compatibility,
      catalogueLoading,

      cart,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      cartSubtotal,
      cartItemCount,
      isCartOpen,
      setIsCartOpen,
      cartNotice,

      isTestDriveOpen,
      setIsTestDriveOpen,
      testDriveTargetVehicle,
      setTestDriveTargetVehicle,

      reviews,
      publishedReviews,
      submitReview,
      isReviewOpen,
      setIsReviewOpen,

      submitOrder,
      submitEnquiry,
      formatKES,
      contact,
      waNumber,
      banners,
      faqs,
    }),
    [
      currentView, navigateTo, navigateBackFromDetail, pageTransition, returningVehicleId, returningPartId,
      selectedVehicleId, selectedPartId, searchQuery,
      vehicles, parts, compatibility, catalogueLoading,
      cart, addToCart, updateCartQty, removeFromCart, clearCart,
      cartSubtotal, cartItemCount, isCartOpen, cartNotice,
      isTestDriveOpen, testDriveTargetVehicle,
      reviews, publishedReviews, submitReview, isReviewOpen,
      submitOrder, submitEnquiry, submitVehicleListing, submitPartListing, contact, waNumber, banners, faqs, catalogueError, retryCatalogue
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};
