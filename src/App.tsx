import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { QuickViewModal } from './components/QuickViewModal.tsx';
import { HomeView } from './views/HomeView.tsx';
import { ShopView } from './views/ShopView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { CheckoutView } from './views/CheckoutView.tsx';
import { AccountView } from './views/AccountView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { StaticPagesView } from './views/StaticPagesView.tsx';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, notification } = useStore();

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'shop':
        return <ShopView />;
      case 'product-detail':
        return <ProductDetailView />;
      case 'checkout':
        return <CheckoutView />;
      case 'account':
        return <AccountView />;
      case 'admin':
        return <AdminView />;
      case 'about':
      case 'contact':
      case 'policies':
        return <StaticPagesView page={activeView} />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#242424] selection:bg-[#E8DDCB] selection:text-[#242424]">
      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#242424] text-[#FAF8F4] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-[#E8DDCB]/30 text-xs font-medium max-w-md">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : notification.type === 'info' ? (
              <Info className="w-4 h-4 text-[#C5A46D] shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Top Header */}
      <Header />

      {/* Dynamic View Routing */}
      <main className="flex-1">
        {renderActiveView()}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Modals & Slide-over Drawers */}
      <CartDrawer />
      <SearchModal />
      <AuthModal />
      <QuickViewModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
