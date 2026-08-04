import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useLenis } from './lib/useLenis';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { TestDriveModal } from './components/TestDriveModal';
import { ReviewModal } from './components/ReviewModal';
import { Cinematics } from './components/cinematic/Cinematics';

import { HomePage } from './pages/HomePage';
import { VehiclesPage } from './pages/VehiclesPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { SparePartsPage } from './pages/SparePartsPage';
import { SparePartDetailPage } from './pages/SparePartDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SellPage } from './pages/SellPage';
import { AboutPage, ContactPage } from './pages/AboutContactPages';
import { NotFoundPage } from './pages/NotFoundPage';

const VIEWS = {
  home: HomePage,
  vehicles: VehiclesPage,
  'vehicle-detail': VehicleDetailPage,
  parts: SparePartsPage,
  'part-detail': SparePartDetailPage,
  checkout: CheckoutPage,
  sell: () => <SellPage mode="car" />,
  'sell-parts': () => <SellPage mode="parts" />,
  about: AboutPage,
  contact: ContactPage,
  'not-found': NotFoundPage,
};

/**
 * Adding to the basket no longer opens a drawer, so nothing is announced to a
 * screen reader by default — the header count changes silently. This says it.
 */
const CartAnnouncer = () => {
  const { cartNotice } = useApp();
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {cartNotice?.text ?? ''}
    </div>
  );
};

const MainContent = () => {
  const { currentView, pageTransition } = useApp();
  useLenis();

  const View = VIEWS[currentView] ?? NotFoundPage;

  let animClass = '';
  if ((currentView === 'vehicle-detail' || currentView === 'part-detail') && pageTransition === 'reveal-detail') {
    animClass = 'animate-vehicle-reveal';
  } else if (pageTransition === 'zoom-back') {
    animClass = 'animate-vehicle-back-exit';
  } else if (pageTransition === 'zoom-back-grid') {
    animClass = 'animate-vehicle-return-grid';
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* First stop for a keyboard or screen-reader user: skip the header's
          nav, search and cart and land on the page itself. */}
      <a href="#main" className="skip-link">Skip to main content</a>

      <Header />
      <main id="main" className={animClass} style={{ flex: 1 }} key={currentView} tabIndex={-1}>
        <View />
      </main>
      <Footer />

      <CartDrawer />
      <TestDriveModal />
      <ReviewModal />
      <Cinematics />
      <CartAnnouncer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
