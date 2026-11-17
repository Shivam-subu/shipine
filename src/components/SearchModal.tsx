import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Search, X, ArrowRight, Star } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const {
    products,
    isSearchOpen,
    setIsSearchOpen,
    navigateToProduct,
    navigateToCategory
  } = useStore();

  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      p => p.name.toLowerCase().includes(q) ||
           p.category.toLowerCase().includes(q) ||
           p.description.toLowerCase().includes(q) ||
           p.material.toLowerCase().includes(q) ||
           (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
    ).slice(0, 6);
  }, [query, products]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E8DDCB] overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-[#FAF8F4] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#C5A46D] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search earrings, celestial pendants, cuffs, pearls..."
            className="flex-1 text-base sm:text-lg text-[#242424] placeholder-[#777777] focus:outline-none"
          />
          <button
            onClick={() => {
              setIsSearchOpen(false);
              setQuery('');
            }}
            className="p-1.5 text-[#777777] hover:text-[#242424] rounded-full hover:bg-[#FAF8F4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Category Shortcuts */}
        {!query.trim() && (
          <div className="p-6 bg-[#FAF8F4] space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777777] block">
              Trending Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {['Anti-Tarnish Hoops', 'Celestial Pendant', 'Tennis Bracelet', 'Pearl Drop', 'Clover Bracelet', 'Waterproof Rings'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3.5 py-1.5 bg-white border border-[#E8DDCB] rounded-full text-xs text-[#242424] hover:bg-[#242424] hover:text-white transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Search Results */}
        {query.trim() && (
          <div className="max-h-96 overflow-y-auto p-4 sm:p-6 space-y-3">
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-[#777777] text-sm">
                No matching jewellery found for "{query}". Try searching by category like "Earrings" or "Necklaces".
              </div>
            ) : (
              searchResults.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    setIsSearchOpen(false);
                    navigateToProduct(product.id);
                  }}
                  className="w-full text-left flex items-center gap-4 p-2.5 rounded-xl hover:bg-[#FAF8F4] transition-colors group cursor-pointer"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover bg-[#FAF8F4] border border-[#E8DDCB]/60 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-[#777777]">
                      <span className="text-[#C5A46D] font-medium uppercase">{product.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-[#242424]">
                        <Star className="w-3 h-3 fill-[#C5A46D] text-[#C5A46D]" />
                        {product.rating}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-semibold text-[#242424] group-hover:text-[#C5A46D] transition-colors truncate">
                      {product.name}
                    </h4>
                    <span className="text-xs font-semibold text-[#242424] tabular-nums">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#777777] group-hover:text-[#242424] group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};
