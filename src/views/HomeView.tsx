import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Hero } from '../components/Hero.tsx';
import { CategoryShowcase } from '../components/CategoryShowcase.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { BrandBenefits } from '../components/BrandBenefits.tsx';
import { EditorialBanner } from '../components/EditorialBanner.tsx';
import { ReviewsSection } from '../components/ReviewsSection.tsx';
import { InstagramGrid } from '../components/InstagramGrid.tsx';
import { Newsletter } from '../components/Newsletter.tsx';
import { ArrowRight, Sparkles } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { products, navigateToCategory } = useStore();

  const bestsellers = products.filter(p => p.isBestseller).slice(0, 8);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);

  return (
    <div className="space-y-0">
      
      {/* C. Hero Section */}
      <Hero />

      {/* D. Shop By Category */}
      <CategoryShowcase />

      {/* E. Best Sellers (8 Products) */}
      <section className="py-16 sm:py-24 bg-[#FAF8F4] border-t border-[#E8DDCB]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[#C5A46D] mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#242424] font-medium tracking-tight">
                Our Bestselling Designs
              </h2>
            </div>

            <button
              onClick={() => navigateToCategory('all')}
              className="self-start sm:self-auto text-xs font-semibold uppercase tracking-wider text-[#242424] hover:text-[#C5A46D] transition-colors flex items-center gap-1.5 cursor-pointer pb-1 border-b border-[#242424] hover:border-[#C5A46D]"
            >
              <span>View All 20 Pieces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* F. Brand Benefits */}
      <BrandBenefits />

      {/* G. New Arrivals Showcase */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#C5A46D] block mb-2">
              Fresh Off The Bench
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#242424] font-medium tracking-tight">
              New Arrivals Collection
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#777777]">
              The latest waterproof silhouette drops — delicate layered chains, floral statements, and sculpted bands.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigateToCategory('all')}
              className="px-8 py-3.5 bg-[#242424] hover:bg-[#C5A46D] text-white rounded-full text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Explore Entire Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* H. Campaign Banner */}
      <EditorialBanner />

      {/* I. Customer Reviews */}
      <ReviewsSection />

      {/* J. Instagram Gallery */}
      <InstagramGrid />

      {/* K. Newsletter Subscription */}
      <Newsletter />

    </div>
  );
};
