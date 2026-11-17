import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ArrowUpRight } from 'lucide-react';

export const CategoryShowcase: React.FC = () => {
  const { categories, navigateToCategory } = useStore();

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A46D] block mb-2">
            Curated Collections
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#242424] font-medium tracking-tight">
            Shop By Category
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#777777]">
            Waterproof, nickel-free everyday jewellery designed for effortless pairing and longevity.
          </p>
        </div>

        {/* 5-Column Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigateToCategory(category.slug)}
              className="group text-left flex flex-col focus:outline-none cursor-pointer"
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF8F4] border border-[#E8DDCB]/60 shadow-sm transition-all duration-500 group-hover:shadow-md group-hover:-translate-y-1">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* Overlay Action Icon */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#242424] group-hover:bg-[#C5A46D] group-hover:text-white transition-colors shadow-sm">
                  <ArrowUpRight className="w-4 h-4" />
                </div>

                {/* Bottom title inside card */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-serif text-lg font-semibold tracking-wide">
                    {category.name}
                  </h3>
                  <span className="text-[11px] text-white/80 font-normal">
                    {category.count} Designs
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};
