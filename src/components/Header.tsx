import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Search, Heart, ShoppingBag, User, ShieldCheck, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    navigateToCategory,
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsSearchOpen,
    setIsAuthOpen,
    currentUser,
    logout
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', action: () => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { label: 'Shop All', action: () => navigateToCategory('all') },
    { label: 'Earrings', action: () => navigateToCategory('earrings') },
    { label: 'Necklaces', action: () => navigateToCategory('necklaces') },
    { label: 'Bracelets', action: () => navigateToCategory('bracelets') },
    { label: 'Rings', action: () => navigateToCategory('rings') },
    { label: 'About Us', action: () => setActiveView('about') },
    { label: 'Contact', action: () => setActiveView('contact') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8DDCB]/60 transition-colors">
      {/* A. Announcement Bar */}
      <div className="bg-[#242424] text-[#FAF8F4] text-xs py-2 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <span>Free Shipping on Orders Above ₹999 | Discover Your Everyday Elegance</span>
        <span className="hidden md:inline text-[#C5A46D] font-semibold">· 100% Anti-Tarnish Guarantee</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#242424] hover:text-[#C5A46D] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Zone 1: Single text element Brand Wordmark */}
          <button
            onClick={() => { setActiveView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-[0.18em] text-[#242424] group-hover:text-[#C5A46D] transition-colors uppercase">
              Shipine
            </span>
          </button>

          {/* Zone 2: Clean single-line desktop navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium tracking-wider text-[#242424]/80">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="whitespace-nowrap shrink-0 hover:text-[#C5A46D] transition-colors py-1 relative group cursor-pointer"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C5A46D] transition-all duration-200 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Zone 3: Interactive Affordances & User Controls */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#242424] hover:text-[#C5A46D] transition-colors rounded-full hover:bg-[#FAF8F4]"
              aria-label="Search jewellery"
              title="Search jewellery"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setActiveView('account')}
              className="p-2 text-[#242424] hover:text-[#C5A46D] transition-colors rounded-full hover:bg-[#FAF8F4] relative"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C5A46D] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-[#242424] hover:text-[#C5A46D] transition-colors rounded-full hover:bg-[#FAF8F4] relative cursor-pointer"
              aria-label="Shopping Bag"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#242424] text-[#FAF8F4] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Role Switcher */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (currentUser) {
                    setActiveView(currentUser.role === 'admin' ? 'admin' : 'account');
                  } else {
                    setIsAuthOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 p-2 text-[#242424] hover:text-[#C5A46D] transition-colors rounded-full hover:bg-[#FAF8F4] cursor-pointer"
                aria-label="User Account"
                title={currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Sign In'}
              >
                <User className="w-5 h-5" />
                {currentUser?.role === 'admin' && (
                  <span className="hidden sm:inline-block text-[11px] bg-[#E8DDCB] text-[#242424] font-medium px-2 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </button>

              {/* Quick switch dropdown on hover */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E8DDCB] rounded-lg shadow-lg py-2 hidden group-hover:block z-50 text-xs">
                {currentUser ? (
                  <>
                    <div className="px-3 py-1.5 border-b border-[#FAF8F4] text-[#777777]">
                      Signed in as <b className="text-[#242424]">{currentUser.fullName || currentUser.email}</b>
                    </div>
                    <button
                      onClick={() => setActiveView('account')}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#FAF8F4] text-[#242424]"
                    >
                      My Account & Orders
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => setActiveView('admin')}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#FAF8F4] text-[#C5A46D] font-semibold"
                      >
                        Admin Command Center
                      </button>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 border-t border-[#FAF8F4]"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsAuthOpen(true)}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#FAF8F4] font-semibold text-[#242424]"
                    >
                      Sign In / Register
                    </button>
                    <button
                      onClick={() => setActiveView('admin')}
                      className="w-full text-left px-3 py-1.5 hover:bg-[#FAF8F4] text-[#777777]"
                    >
                      Admin Portal
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F4] border-b border-[#E8DDCB] px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm font-medium">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  link.action();
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 px-3 rounded hover:bg-white text-[#242424] hover:text-[#C5A46D]"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E8DDCB] flex items-center justify-between text-xs">
            {currentUser ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Sign Out ({currentUser.fullName || currentUser.email})
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsAuthOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="text-[#242424] hover:text-[#C5A46D] font-semibold underline"
              >
                Sign In / Register
              </button>
            )}
            <span className="text-[#777777]">Free Shipping &gt; ₹999</span>
          </div>
        </div>
      )}
    </header>
  );
};
