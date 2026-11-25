import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Sparkles, ArrowRight, ShieldCheck, Droplets } from 'lucide-react';
import { ASSET_HERO, HERO_SIZES } from '../lib/images.ts';
import { ResponsiveImage } from './ResponsiveImage.tsx';

export const Hero: React.FC = () => {
  const { navigateToCategory, setActiveView } = useStore();

  return (
    <section className="relative overflow-hidden bg-[#FAF8F4] border-b border-[#E8DDCB]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Messaging */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#C5A46D]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>18K Gold PVD Waterproof Anti-Tarnish</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#242424] leading-[1.15] text-balance">
              Elegance That Lasts.
            </h1>

            <p className="text-base sm:text-lg text-[#777777] max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed text-pretty">
              Discover timeless anti-tarnish jewellery designed to make every day feel special.
              Engineered with 316L stainless steel and 18K vacuum gold to resist water, sweat, and perfumes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigateToCategory('all')}
                className="w-full sm:w-auto px-8 py-4 bg-[#242424] text-[#FAF8F4] text-sm font-medium tracking-wider uppercase rounded-full hover:bg-[#C5A46D] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  navigateToCategory('all');
                }}
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[#242424] text-[#242424] text-sm font-medium tracking-wider uppercase rounded-full hover:bg-[#E8DDCB]/40 transition-colors cursor-pointer"
              >
                Explore Bestsellers
              </button>
            </div>

            {/* Quiet trust strip */}
            <div className="pt-6 border-t border-[#E8DDCB]/60 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <span className="block font-serif text-xl sm:text-2xl font-semibold text-[#242424]">100%</span>
                <span className="text-xs text-[#777777] tracking-tight">Waterproof & Sweatproof</span>
              </div>
              <div>
                <span className="block font-serif text-xl sm:text-2xl font-semibold text-[#242424]">18K</span>
                <span className="text-xs text-[#777777] tracking-tight">Vacuum Gold Finish</span>
              </div>
              <div>
                <span className="block font-serif text-xl sm:text-2xl font-semibold text-[#242424]">0%</span>
                <span className="text-xs text-[#777777] tracking-tight">Nickel or Green Skin</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Campaign Visual */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-[#E8DDCB] shadow-xl border border-white/50 relative group">
                <ResponsiveImage
                  src={ASSET_HERO}
                  sizes={HERO_SIZES}
                  alt="Shipine Jewellery Campaign Model wearing 18K Anti-Tarnish Gold Necklaces and Earrings"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  fetchPriority="high"
                />

                {/* Subtle soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

                {/* Floating luxury editorial card */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md p-4 rounded-xl border border-[#E8DDCB] shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F4] border border-[#E8DDCB] flex items-center justify-center text-[#C5A46D]">
                      <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#242424]">Shower & Swim Safe</p>
                      <p className="text-[11px] text-[#777777]">Permanent anti-tarnish molecular bond</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative accent geometry */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#E8DDCB]/40 rounded-full blur-2xl -z-10" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
