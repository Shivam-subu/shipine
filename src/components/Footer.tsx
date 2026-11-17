import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Instagram, Facebook, MessageCircle, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, navigateToCategory, switchUserRole } = useStore();

  return (
    <footer className="bg-[#242424] text-[#FAF8F4] pt-16 pb-12 border-t border-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#383838]">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-2xl font-semibold tracking-widest text-[#FAF8F4] uppercase">
              Shipine
            </h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed max-w-sm">
              Jewellery That Stays Beautiful. Premium 18K gold PVD waterproof jewellery designed for the modern woman's everyday lifestyle. Never tarnishes, never leaves green skin.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#333333] hover:bg-[#C5A46D] hover:text-[#242424] transition-colors flex items-center justify-center text-[#FAF8F4]"
                aria-label="Shipine on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#333333] hover:bg-[#C5A46D] hover:text-[#242424] transition-colors flex items-center justify-center text-[#FAF8F4]"
                aria-label="Shipine on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#333333] hover:bg-[#C5A46D] hover:text-[#242424] transition-colors flex items-center justify-center text-[#FAF8F4]"
                aria-label="Shipine on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#C5A46D]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#A0A0A0]">
              <li>
                <button onClick={() => navigateToCategory('all')} className="hover:text-white transition-colors">
                  All Jewellery
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('earrings')} className="hover:text-white transition-colors">
                  Anti-Tarnish Earrings
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('necklaces')} className="hover:text-white transition-colors">
                  Everyday Necklaces
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('bracelets')} className="hover:text-white transition-colors">
                  Gold Bracelets & Cuffs
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('rings')} className="hover:text-white transition-colors">
                  Stackable Rings
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('jewellery-sets')} className="hover:text-white transition-colors">
                  Luxury Gift Sets
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#C5A46D]">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-[#A0A0A0]">
              <li>
                <button onClick={() => setActiveView('about')} className="hover:text-white transition-colors">
                  About Shipine
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('contact')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('policies')} className="hover:text-white transition-colors">
                  FAQs & Care Guide
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('policies')} className="hover:text-white transition-colors">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('policies')} className="hover:text-white transition-colors">
                  Return & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('account')} className="hover:text-white transition-colors">
                  Track Your Order
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Help & Admin */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#C5A46D]">
              Store & Admin
            </h4>
            <p className="text-xs text-[#A0A0A0]">
              Indiranagar 100ft Road,<br />
              Bengaluru, Karnataka 560038<br />
              care@shipine.com<br />
              +91 98765 43210
            </p>
            <div className="pt-2">
              <button
                onClick={() => switchUserRole('admin')}
                className="text-xs text-[#C5A46D] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Management Panel</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#888888]">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} SHIPINE Jewels Pvt Ltd. Crafted with</span>
            <Heart className="w-3 h-3 text-[#C5A46D] inline fill-[#C5A46D]" />
            <span>in India. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('policies')} className="hover:text-white">Privacy Policy</button>
            <span>·</span>
            <button onClick={() => setActiveView('policies')} className="hover:text-white">Terms & Conditions</button>
            <span>·</span>
            <span>100% Secure Razorpay & UPI Checkout</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
