import React from 'react';
import { Instagram } from 'lucide-react';
import { ASSET_HERO, ASSET_EARRINGS, ASSET_NECKLACES, ASSET_BRACELETS, ASSET_CAMPAIGN } from '../data/products.ts';

export const InstagramGrid: React.FC = () => {
  const posts = [
    { image: ASSET_HERO, tag: '@shipine.jewels', caption: 'The everyday golden stack.' },
    { image: ASSET_EARRINGS, tag: '@ananya_style', caption: 'Pearls for every mood.' },
    { image: ASSET_NECKLACES, tag: '@priyamehta', caption: 'Celestial pendant catching the dusk glow.' },
    { image: ASSET_BRACELETS, tag: '@shradhas', caption: 'Four leaf clover charm on vacation.' },
    { image: ASSET_CAMPAIGN, tag: '@shipine.jewels', caption: 'Stackable rings that never turn green.' }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[#C5A46D] mb-2">
            <Instagram className="w-3.5 h-3.5" />
            <span>#ShipineStyle</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#242424] font-medium tracking-tight">
            Follow Our Everyday Journey
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#777777]">
            Tag @shipine.jewels on Instagram to be featured on our curated community gallery.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {posts.map((post, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-2xl overflow-hidden group bg-[#FAF8F4] border border-[#E8DDCB]/60 shadow-sm cursor-pointer"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-white text-center">
                <Instagram className="w-6 h-6 mb-2 text-[#C5A46D]" />
                <span className="text-xs font-semibold">{post.tag}</span>
                <span className="text-[11px] text-white/80 line-clamp-2 mt-1">{post.caption}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
