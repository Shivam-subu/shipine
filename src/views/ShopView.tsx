import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { Filter, SlidersHorizontal, Search, X, Check } from 'lucide-react';

export const ShopView: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState<'popular' | 'price-asc' | 'price-desc' | 'newest' | 'discount'>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(4000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlySale, setOnlySale] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category match
      if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesMaterial = p.material.toLowerCase().includes(q);
        const matchesTags = p.tags && p.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesMaterial && !matchesTags) {
          return false;
        }
      }
      // Price match
      if (p.price > maxPrice) {
        return false;
      }
      // In stock
      if (onlyInStock && p.stock <= 0) {
        return false;
      }
      // On sale
      if (onlySale && p.discountPercent <= 0) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (selectedSort === 'price-asc') return a.price - b.price;
      if (selectedSort === 'price-desc') return b.price - a.price;
      if (selectedSort === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      if (selectedSort === 'discount') return b.discountPercent - a.discountPercent;
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, maxPrice, onlyInStock, onlySale, selectedSort]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPrice(4000);
    setOnlyInStock(false);
    setOnlySale(false);
    setSelectedSort('popular');
  };

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery !== '' || maxPrice < 4000 || onlyInStock || onlySale;

  return (
    <div className="bg-[#FAF8F4] min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title & Breadcrumbs */}
        <div className="mb-8">
          <div className="text-xs text-[#777777] mb-2 flex items-center gap-2">
            <span>Home</span>
            <span>/</span>
            <span>Jewellery Catalog</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-[#242424] capitalize font-medium">{selectedCategory}</span>
              </>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#242424] font-medium tracking-tight">
            {selectedCategory === 'all'
              ? 'All Anti-Tarnish Jewellery'
              : categories.find(c => c.slug === selectedCategory)?.name || 'Jewellery Collection'}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#777777] max-w-2xl">
            Hypoallergenic 316L stainless steel jewellery sealed with 18K vacuum gold PVD. Waterproof, sweatproof, and guaranteed to never tarnish.
          </p>
        </div>

        {/* Top Control Bar: Category Tabs & Mobile Filter Trigger */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E8DDCB]/60 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Functional Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#242424] text-white shadow-xs'
                  : 'bg-[#FAF8F4] text-[#242424] hover:bg-[#E8DDCB]/40'
              }`}
            >
              All Pieces ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-[#242424] text-white shadow-xs'
                    : 'bg-[#FAF8F4] text-[#242424] hover:bg-[#E8DDCB]/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right Tools: Sort Dropdown & Mobile Filter Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-3.5 py-2 bg-[#FAF8F4] border border-[#E8DDCB] text-[#242424] rounded-xl text-xs font-medium flex items-center gap-2"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A46D]" />
              <span>Filters</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#777777] hidden sm:inline">Sort By:</span>
              <select
                value={selectedSort}
                onChange={(e: any) => setSelectedSort(e.target.value)}
                className="bg-[#FAF8F4] border border-[#E8DDCB] text-[#242424] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#C5A46D]"
              >
                <option value="popular">Popularity & Bestsellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>

        </div>

        {/* Main Catalog Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Sidebar Filters */}
          <div className={`lg:block ${isMobileFilterOpen ? 'block' : 'hidden'} space-y-6`}>
            <div className="bg-white p-6 rounded-2xl border border-[#E8DDCB]/60 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#FAF8F4]">
                <h3 className="font-serif text-base font-semibold text-[#242424] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#C5A46D]" />
                  <span>Refine Selection</span>
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-[#C5A46D] hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Keyword Search */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#242424]">Search Within Category</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-[#777777] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Hoops, Clover..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F4] border border-[#E8DDCB] rounded-lg focus:outline-none focus:border-[#C5A46D]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-[#777777] hover:text-[#242424]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#242424]">Maximum Price</span>
                  <span className="font-bold text-[#C5A46D] tabular-nums">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="4000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#C5A46D] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#777777]">
                  <span>₹800</span>
                  <span>₹4,000+</span>
                </div>
              </div>

              {/* Checkbox Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-[#FAF8F4]">
                <label className="flex items-center gap-2.5 text-xs text-[#242424] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded text-[#242424] focus:ring-0 accent-[#242424]"
                  />
                  <span>In Stock Only</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-[#242424] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlySale}
                    onChange={(e) => setOnlySale(e.target.checked)}
                    className="rounded text-[#242424] focus:ring-0 accent-[#242424]"
                  />
                  <span>Promotional Discount Items</span>
                </label>
              </div>

              {/* Anti-Tarnish Assurance Card */}
              <div className="p-4 bg-[#FAF8F4] rounded-xl border border-[#E8DDCB]/60 text-xs space-y-1">
                <p className="font-semibold text-[#242424]">Shipine Promise</p>
                <p className="text-[11px] text-[#777777]">
                  All pieces are crafted in 316L medical stainless steel with 18K gold PVD ion coating. Guaranteed waterproof and tarnish-free.
                </p>
              </div>

            </div>
          </div>

          {/* Right Area: Product Grid */}
          <div className="lg:col-span-3">
            
            {/* Results Count & Active Pills */}
            <div className="mb-4 flex items-center justify-between text-xs text-[#777777]">
              <span>
                Showing <b className="text-[#242424]">{filteredProducts.length}</b> of {products.length} jewellery items
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#E8DDCB]/60 space-y-4">
                <h3 className="font-serif text-xl font-medium text-[#242424]">
                  No designs match your criteria
                </h3>
                <p className="text-xs text-[#777777] max-w-sm mx-auto">
                  Try adjusting your price range, clearing search terms, or exploring other categories.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#242424] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A46D] transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
