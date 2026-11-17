import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { X, Star, ShoppingBag, ShieldCheck, ArrowRight, Droplets, Heart } from 'lucide-react';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    navigateToProduct,
    toggleWishlist,
    isInWishlist
  } = useStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isFavorited = isInWishlist(product.id);
  const activeVariantId = selectedVariantId || product.variants[0]?.id;
  const activeVariant = product.variants.find(v => v.id === activeVariantId) || product.variants[0];

  const handleAddToCart = () => {
    addToCart(product, activeVariantId, quantity);
    setQuickViewProduct(null);
  };

  const handleFullView = () => {
    setQuickViewProduct(null);
    navigateToProduct(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#E8DDCB] relative">
        
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-10 p-2 text-[#777777] hover:text-[#242424] rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Product Image */}
          <div className="relative aspect-square bg-[#FAF8F4] overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 bg-[#242424]/90 text-white text-[10px] uppercase font-semibold px-2.5 py-1 rounded-md">
              Anti-Tarnish PVD
            </div>
          </div>

          {/* Details & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-[#C5A46D] font-medium">
                  {product.category}
                </span>
                <span className="text-xs text-[#777777]">SKU: {product.sku}</span>
              </div>

              <h2 className="font-serif text-2xl font-semibold text-[#242424]">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 text-xs text-[#777777]">
                <div className="flex items-center gap-1 text-[#242424] font-medium">
                  <Star className="w-4 h-4 fill-[#C5A46D] text-[#C5A46D]" />
                  <span>{product.rating}</span>
                </div>
                <span>·</span>
                <span>{product.reviewCount} Verified Customer Reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-semibold text-[#242424] tabular-nums">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-[#777777] line-through tabular-nums">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="text-xs font-semibold text-emerald-700">
                    Save {product.discountPercent}%
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#777777] line-clamp-3 leading-relaxed">
                {product.description}
              </p>

              {/* Variant Selector */}
              {product.variants.length > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#242424] mb-1.5">
                    Finish: <span className="text-[#C5A46D]">{activeVariant?.name}</span>
                  </label>
                  <div className="flex gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          activeVariantId === v.id
                            ? 'border-[#242424] bg-[#242424] text-white shadow-xs'
                            : 'border-[#E8DDCB] bg-white text-[#242424] hover:bg-[#FAF8F4]'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-3 border-t border-[#FAF8F4]">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 bg-[#242424] hover:bg-[#C5A46D] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 rounded-full border transition-colors ${
                    isFavorited
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-[#E8DDCB] text-[#242424] hover:bg-[#FAF8F4]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                onClick={handleFullView}
                className="w-full text-center text-xs text-[#777777] hover:text-[#242424] font-medium flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Full Product Specifications & Reviews</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
