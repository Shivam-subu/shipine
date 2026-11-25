import React from 'react';
import { ResponsiveImage } from './ResponsiveImage.tsx';
import { Product } from '../types/index.ts';
import { useStore } from '../context/StoreContext.tsx';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    navigateToProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct
  } = useStore();

  const isFavorited = isInWishlist(product.id);

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-[#E8DDCB]/60 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-[#FAF8F4] overflow-hidden">
        <button
          onClick={() => navigateToProduct(product.id)}
          className="w-full h-full block focus:outline-none cursor-pointer"
          aria-label={`View ${product.name}`}
        >
          <ResponsiveImage
            src={product.images[0]}
            sizes="(min-width: 1280px) 290px, (min-width: 1024px) 23vw, (min-width: 768px) 31vw, calc(50vw - 24px)"
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* Top-Right Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
            isFavorited
              ? 'bg-red-50 text-red-500 border border-red-200'
              : 'bg-white/90 backdrop-blur-sm text-[#242424] hover:text-red-500 hover:bg-white'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Top-Left Subtle Tag (Max 1 subtle text tag, zero-pill discipline) */}
        {product.isBestseller && (
          <div className="absolute top-3 left-3 bg-[#242424]/90 backdrop-blur-sm text-[#FAF8F4] text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-md shadow-sm">
            Bestseller
          </div>
        )}
        {!product.isBestseller && product.isNewArrival && (
          <div className="absolute top-3 left-3 bg-[#C5A46D] text-white text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-md shadow-sm">
            New
          </div>
        )}

        {/* Quick View Button Hover Overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="flex-1 py-2 bg-white/95 backdrop-blur-sm text-[#242424] text-xs font-medium rounded-lg shadow hover:bg-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#777777]" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        
        <div className="space-y-1.5">
          {/* Zero-Pill Unboxed Metadata with Typographic Separator */}
          <div className="flex items-center gap-2 text-xs text-[#777777]">
            <span className="uppercase tracking-wider text-[11px] font-medium text-[#C5A46D]">
              {product.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-[#242424] font-medium">
              <Star className="w-3.5 h-3.5 fill-[#C5A46D] text-[#C5A46D]" />
              <span className="tabular-nums">{product.rating}</span>
              <span className="text-[#777777] font-normal">({product.reviewCount})</span>
            </span>
          </div>

          {/* Product Title */}
          <button
            onClick={() => navigateToProduct(product.id)}
            className="text-left font-serif text-base sm:text-lg font-medium text-[#242424] hover:text-[#C5A46D] transition-colors line-clamp-1 cursor-pointer"
          >
            {product.name}
          </button>

          {/* Key Product Benefit */}
          <p className="text-xs text-[#777777] line-clamp-1">
            {product.material.split(',')[0]}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-[#FAF8F4] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-semibold text-[#242424] tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#777777] line-through tabular-nums">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.discountPercent > 0 && (
              <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            className="p-2 sm:px-3 sm:py-2 bg-[#FAF8F4] hover:bg-[#242424] text-[#242424] hover:text-white rounded-lg transition-all duration-200 border border-[#E8DDCB] flex items-center gap-1.5 cursor-pointer text-xs font-medium"
            aria-label={`Add ${product.name} to cart`}
            title="Add to Bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

      </div>

    </div>
  );
};
