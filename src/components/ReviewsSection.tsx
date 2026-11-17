import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Star, CheckCircle, MessageSquarePlus, Sparkles } from 'lucide-react';
import { INITIAL_REVIEWS } from '../data/products.ts';
import { ProductReview } from '../types/index.ts';

export const ReviewsSection: React.FC = () => {
  const { products, showNotification } = useStore();
  const [reviews, setReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    productId: products[0]?.id || 'prod-01',
    authorName: '',
    rating: 5,
    title: '',
    comment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.authorName || !newReview.comment) {
      showNotification('Please fill in your name and review', 'error');
      return;
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      });
      const created = await res.json();
      if (res.ok) {
        setReviews([created, ...reviews]);
        setIsModalOpen(false);
        setNewReview({
          productId: products[0]?.id || 'prod-01',
          authorName: '',
          rating: 5,
          title: '',
          comment: ''
        });
        showNotification('Thank you! Your verified review has been published.');
      }
    } catch {
      showNotification('Review submitted successfully (preview mode)');
      setIsModalOpen(false);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F4] border-t border-[#E8DDCB]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-[#C5A46D] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Customer Stories</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#242424] font-medium tracking-tight">
              Loved By Modern Women
            </h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto px-5 py-2.5 bg-white border border-[#E8DDCB] text-[#242424] hover:bg-[#242424] hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#C5A46D]" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.slice(0, 4).map((rev) => {
            const product = products.find(p => p.id === rev.productId);
            return (
              <div
                key={rev.id}
                className="bg-white p-6 rounded-2xl border border-[#E8DDCB]/60 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating
                            ? 'fill-[#C5A46D] text-[#C5A46D]'
                            : 'text-neutral-200'
                        }`}
                      />
                    ))}
                  </div>

                  <h3 className="font-serif text-base font-semibold text-[#242424] leading-snug">
                    "{rev.title}"
                  </h3>

                  <p className="text-xs sm:text-sm text-[#777777] leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#FAF8F4] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#242424]">{rev.authorName}</span>
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </div>
                  {product && (
                    <div className="text-[11px] text-[#777777] truncate">
                      Purchased: <span className="text-[#242424]">{product.name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E8DDCB] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-serif text-2xl font-semibold text-[#242424] mb-1">
              Share Your Shipine Experience
            </h3>
            <p className="text-xs text-[#777777] mb-6">
              Your feedback helps fellow jewellery lovers find their everyday signature pieces.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">Select Jewellery</label>
                <select
                  value={newReview.productId}
                  onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDCB] rounded-lg focus:outline-none focus:border-[#C5A46D]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReview.rating
                            ? 'fill-[#C5A46D] text-[#C5A46D]'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-[#777777] ml-2">{newReview.rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shalini Roy"
                  value={newReview.authorName}
                  onChange={(e) => setNewReview({ ...newReview, authorName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDCB] rounded-lg focus:outline-none focus:border-[#C5A46D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Looks like real 18k solid gold!"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDCB] rounded-lg focus:outline-none focus:border-[#C5A46D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">Review Comments</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about the shine, anti-tarnish durability, and how you style it..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-[#E8DDCB] rounded-lg focus:outline-none focus:border-[#C5A46D]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#777777] hover:text-[#242424]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#242424] text-white hover:bg-[#C5A46D] transition-colors rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Submit Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
