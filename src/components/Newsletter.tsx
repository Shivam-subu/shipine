import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Mail, ArrowRight, Check } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const { showNotification } = useStore();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setIsSubmitted(true);
      showNotification(data.message || 'Subscribed successfully!');
      setEmail('');
    } catch {
      setIsSubmitted(true);
      showNotification('Thank you for subscribing to Shipine updates!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F4] border-t border-[#E8DDCB]/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div className="w-12 h-12 rounded-full bg-white border border-[#E8DDCB] text-[#C5A46D] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Mail className="w-5 h-5" />
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-[#242424] font-medium tracking-tight">
          Stay in the Loop
        </h2>

        <p className="mt-3 text-sm sm:text-base text-[#777777] max-w-lg mx-auto">
          Get updates on new collections, exclusive offers, anti-tarnish styling tips, and private sale invitations.
        </p>

        {isSubmitted ? (
          <div className="mt-8 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-3 rounded-full text-sm font-medium">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>You're on the insider list! Use code FIRST10 for 10% off your first order.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3.5 bg-white border border-[#E8DDCB] rounded-full text-sm text-[#242424] placeholder-[#777777] focus:outline-none focus:border-[#C5A46D] shadow-sm"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 bg-[#242424] text-white hover:bg-[#C5A46D] transition-colors rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Joining...' : 'Subscribe'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <p className="mt-4 text-[11px] text-[#777777]">
          We respect your privacy. No spam, ever. Unsubscribe with one click anytime.
        </p>

      </div>
    </section>
  );
};
