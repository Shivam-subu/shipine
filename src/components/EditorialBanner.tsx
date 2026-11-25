import React from 'react';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import { useStore } from '../context/StoreContext.tsx';
import { ArrowRight } from 'lucide-react';
import { ASSET_CAMPAIGN } from '../lib/images.ts';

export const EditorialBanner: React.FC = () => {
  const { navigateToCategory } = useStore();

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#242424] min-h-[380px] sm:min-h-[440px] flex items-center shadow-xl">
          
          {/* Background Photography */}
          <div className="absolute inset-0 z-0">
            <ResponsiveImage
              src={ASSET_CAMPAIGN}
              sizes="(min-width: 1280px) 1216px, calc(100vw - 32px)"
              alt="Shipine Jewellery Rings & Stackable Bracelets Campaign"
              className="w-full h-full object-cover object-center brightness-75 scale-102"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>

          {/* Text Content Overlay */}
          <div className="relative z-10 p-8 sm:p-14 lg:p-20 max-w-xl text-white space-y-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A46D] block">
              The Signature Edit
            </span>
            
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white leading-tight">
              Little Details. Endless Elegance.
            </h2>
            
            <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed">
              Every curve, clasp, and luster is refined for daily comfort. Elevate your wrist and finger stacks with designs crafted to stay beautiful for years.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => navigateToCategory('bracelets')}
                className="px-7 py-3.5 bg-white text-[#242424] hover:bg-[#C5A46D] hover:text-white transition-all text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-2 group cursor-pointer"
              >
                <span>Shop Bracelets</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigateToCategory('rings')}
                className="px-7 py-3.5 bg-transparent border border-white/80 text-white hover:bg-white/10 transition-colors text-xs font-semibold uppercase tracking-wider rounded-full cursor-pointer"
              >
                Explore Rings
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
