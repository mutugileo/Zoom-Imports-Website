import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_VEHICLES,
  INITIAL_PARTS,
  COMPATIBILITY_RULES,
  INITIAL_ORDERS,
  INITIAL_ENQUIRIES,
  TESTIMONIALS,
} from '@shared/data/mockData';
import { DEFAULT_CONTACT, DEFAULT_BANNERS, DEFAULT_FAQS } from '@shared/data/siteContent';
import { formatKES, formatDate } from '@shared/lib/format';
import { KEYS, read, readSafe, write, makeOrderRef } from '@shared/lib/store';
import { routeFromPath, pathFor, titleFor } from '../lib/router';

/**
 * Customer-facing state only. Catalogue data is READ here — the shop never
 * edits vehicles, parts or compatibility rules; that lives in the admin app.
 */

const AppContext = createContext(null);

/** Flip to true to demo a pre-filled cart. Real visitors must start empty. */
const DEMO_SEED_CART = false;

export const AppProvider = ({ children }) => {
  /**
   * The URL is the source of truth for which view is showing.
   *
   * Catalogue data is read below, but the first route has to be resolved before
   * paint or a deep link would flash the homepage first. The lists are read
   * synchronously from the same store, so they are safe to read twice here —
   * this is the one place that ordering matters.
   */
  // Optional chaining, not a `typeof window` guard: a non-browser host can
  // supply a partial window, and reading .pathname off it throws during render.
  const initialRoute = routeFromPath(
    (typeof window === 'undefined' ? null : window.location?.pathname) ?? '/',
    { vehicles: read(KEYS.vehicles, INITIAL_VEHICLES), parts: read(KEYS.parts, INITIAL_PARTS) }
  );

  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [selectedVehicleId, setSelectedVehicleId] = useState(initialRoute.vehicleId ?? 1);
  const [selectedPartId, setSelectedPartId] = useState(initialRoute.partId ?? 1);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState(null);
  const [isTestDriveOpen, setIsTestDriveOpen] = useState(false);
  const [testDriveTargetVehicle, setTestDriveTargetVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Catalogue — read-only on this surface.
   *
   * The read reports whether it succeeded. Without that a blocked or corrupted
   * store is indistinguishable from an empty catalogue, and the listing pages
   * would tell a customer there are no cars. `catalogueError` lets them say what
   * actually happened instead.
   */
  const vehiclesRead = useState(() => readSafe(KEYS.vehicles, INITIAL_VEHICLES))[0];
  const partsRead = useState(() => readSafe(KEYS.parts, INITIAL_PARTS))[0];

  const [vehicles] = useState(vehiclesRead.value);
  const [parts] = useState(partsRead.value);
  const [compatibility] = useState(() => read(KEYS.compatibility, COMPATIBILITY_RULES));

  /**
   * Contact details, from the same record the admin portal's Site Content
   * screen writes.
   *
   * They were hardcoded in eight places across the header, footer, contact
   * page and every WhatsApp link — so the screen that exists to edit them
   * changed nothing, and the site disagreed with itself: the footer advertised
   * sales@ while the contact page advertised hello@. One read, one source.
   *
   * `waNumber` is the phone with everything but the digits taken out, because
   * wa.me will not accept spaces or a plus sign.
   */
  const [siteContent] = useState(() => {
    const stored = read(KEYS.siteContent, null);
    return {
      contact: { ...DEFAULT_CONTACT, ...(stored?.contact ?? {}) },
      banners: stored?.banners ?? DEFAULT_BANNERS,
      faqs: stored?.faqs ?? DEFAULT_FAQS,
    };
  });
  const { contact, banners, faqs } = siteContent;
  const waNumber = String(contact.whatsapp || contact.phone || '').replace(/\D/g, '');

  // Retry means reload: the data is read once at mount, so there is nothing
  // finer-grained to re-run.
  const [catalogueError, setCatalogueError] = useState(
    vehiclesRead.ok && partsRead.ok ? null : (vehiclesRead.reason ?? partsRead.reason)
  );
  const retryCatalogue = useCallback(() => {
    setCatalogueError(null);
    if (typeof window !== 'undefined') window.location.reload();
  }, []);

  const [cart, setCart] = useState(() =>
    read(
      KEYS.cart,
      DEMO_SEED_CART
        ? [
            { id: 1, name: 'Brake Pad Set (Front)', price: 3800, qty: 2, img: INITIAL_PARTS[0].img, brand: 'Mazda Genuine' },
            { id: 5, name: 'Aluminum Radiator', price: 8200, qty: 1, img: INITIAL_PARTS[4].img, brand: 'Mazda Genuine' },
          ]
        : []
    )
  );
  const [orders, setOrders] = useState(() => read(KEYS.orders, INITIAL_ORDERS));
  const [enquiries, setEnquiries] = useState(() => read(KEYS.enquiries, INITIAL_ENQUIRIES));

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviews, setReviews] = useState(() =>
    read(KEYS.reviews, TESTIMONIALS.map((t) => ({ ...t, rating: 5, status: 'Published' })))
  );

  // The cart survives a refresh mid-checkout.
  useEffect(() => { write(KEYS.cart, cart); }, [cart]);
  useEffect(() => { write(KEYS.orders, orders); }, [orders]);
  useEffect(() => { write(KEYS.enquiries, enquiries); }, [enquiries]);
  useEffect(() => { write(KEYS.reviews, reviews); }, [reviews]);

  const applyRoute = useCallback((route) => {
    if (route.vehicleId != null) setSelectedVehicleId(route.vehicleId);
    if (route.partId != null) setSelectedPartId(route.partId);
    setCurrentView(route.view);
  }, []);

  const navigateTo = useCallback((view, payloadId = null) => {
    if (payloadId != null) {
      if (view === 'vehicle-detail') setSelectedVehicleId(payloadId);
      if (view === 'part-detail') setSelectedPartId(payloadId);
    }
    setCurrentView(view);

    const path = pathFor(view, { id: payloadId, vehicles, parts });
    // Re-clicking the current link should not stack duplicate history entries.
    if (path !== window.location.pathname) {
      window.history.pushState({ view, id: payloadId }, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [vehicles, parts]);

  /**
   * Back and forward. Without this the browser would change the URL while the
   * app kept rendering the old view — worse than having no routing at all.
   */
  useEffect(() => {
    const onPop = () => {
      applyRoute(routeFromPath(window.location.pathname, { vehicles, parts }));
      // No smooth scroll here: returning to a listing should feel like a
      // restoration, not a fresh navigation.
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [applyRoute, vehicles, parts]);

  /** Distinguishable tab and history-entry titles. */
  useEffect(() => {
    const record =
      currentView === 'vehicle-detail' ? vehicles.find((v) => v.id === selectedVehicleId)
      : currentView === 'part-detail' ? parts.find((p) => p.id === selectedPartId)
      : null;
    document.title = titleFor(currentView, record);
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
    (customerDetails) => {
      const newOrder = {
        ref: makeOrderRef(orders.map((o) => o.ref)),
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
      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      return newOrder;
    },
    [cart, cartSubtotal, orders, clearCart]
  );

  /**
   * A submitted review is held as 'Pending', not published.
   *
   * Anything a stranger types would otherwise appear verbatim on the homepage
   * of a real dealership. Reviews wait for someone to approve them; the
   * homepage only renders status === 'Published'.
   */
  const submitReview = useCallback((reviewData) => {
    const newReview = {
      id: Date.now(),
      name: reviewData.name.trim(),
      role: reviewData.role.trim() || 'Verified customer',
      quote: reviewData.quote.trim(),
      rating: reviewData.rating,
      status: 'Pending',
      date: formatDate(),
    };
    setReviews((prev) => [newReview, ...prev]);
    return newReview;
  }, []);

  const publishedReviews = useMemo(
    () => reviews.filter((r) => r.status === 'Published'),
    [reviews]
  );

  const submitEnquiry = useCallback((enquiryData) => {
    const newEnquiry = {
      id: Date.now(),
      customer: enquiryData.name,
      phone: enquiryData.phone,
      vehicle: enquiryData.vehicleName || 'General Enquiry',
      type: enquiryData.type || 'Test Drive Request',
      preferredDate: enquiryData.preferredDate || '',
      status: 'New',
      date: formatDate(),
    };
    setEnquiries((prev) => [newEnquiry, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      currentView,
      navigateTo,
      catalogueError,
      retryCatalogue,
      selectedVehicleId,
      selectedPartId,
      searchQuery,
      setSearchQuery,

      vehicles,
      parts,
      compatibility,
      orders,
      enquiries,

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
      currentView, navigateTo, selectedVehicleId, selectedPartId, searchQuery,
      vehicles, parts, compatibility, orders, enquiries,
      cart, addToCart, updateCartQty, removeFromCart, clearCart,
      cartSubtotal, cartItemCount, isCartOpen, cartNotice,
      isTestDriveOpen, testDriveTargetVehicle,
      reviews, publishedReviews, submitReview, isReviewOpen,
      submitOrder, submitEnquiry, contact, waNumber, banners, faqs,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
};
