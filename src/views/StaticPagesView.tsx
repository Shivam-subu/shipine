import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { ShieldCheck, Mail, Phone, MapPin, CheckCircle, ArrowRight, Droplets, Sparkles, Send } from 'lucide-react';
import { ASSET_HERO, ASSET_CAMPAIGN } from '../data/products.ts';

interface StaticPagesProps {
  page: 'about' | 'contact' | 'policies';
}

export const StaticPagesView: React.FC<StaticPagesProps> = ({ page }) => {
  const { setActiveView, showNotification } = useStore();

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'Order Inquiry',
    message: ''
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification('Thank you! Our concierge team will reply to your message within 24 hours.');
    setContactForm({ name: '', email: '', subject: 'Order Inquiry', message: '' });
  };

  if (page === 'about') {
    return (
      <div className="bg-[#FAF8F4] min-h-screen py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-semibold">Our Philosophy</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-[#242424] tracking-tight">
              Jewellery That Stays Beautiful.
            </h1>
            <p className="text-sm sm:text-base text-[#777777] leading-relaxed">
              Shipine was born out of a simple frustration: why does fashion jewellery lose its shine, discolor after a single summer shower, or turn sensitive skin green?
            </p>
          </div>

          {/* Hero Banner */}
          <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-lg border border-[#E8DDCB]">
            <img src={ASSET_CAMPAIGN} alt="Shipine Craftsmanship" className="w-full h-full object-cover" />
          </div>

          {/* The Science of Anti-Tarnish */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-semibold">Engineering Longevity</span>
              <h2 className="font-serif text-3xl font-medium text-[#242424]">
                Physical Vapor Deposition (PVD)
              </h2>
              <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                Traditional fashion jewellery uses electroplating, a thin chemical dip that wears off in weeks. At Shipine, our pieces start with solid 316L surgical-grade stainless steel. In a high-temperature vacuum chamber, real 18-karat gold vapor is bonded molecularly into the steel surface.
              </p>
              <div className="space-y-2 pt-2 text-xs text-[#242424] font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>10x more wear-resistant than conventional gold plating</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>100% waterproof — gym, swimming pool, and ocean tested</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Nickel-free, lead-free, and hypoallergenic</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-3xl border border-[#E8DDCB] shadow-xs space-y-4">
              <h3 className="font-serif text-xl font-semibold text-[#242424]">The Shipine Standard</h3>
              <p className="text-xs text-[#777777] leading-relaxed">
                We believe true luxury is effortless. You shouldn't have to take off your necklaces before stepping into the shower or worrying about lotion tarnishing your favorite rings.
              </p>
              <div className="p-4 bg-[#FAF8F4] rounded-2xl border border-[#E8DDCB]/60 text-xs">
                <p className="font-semibold text-[#242424]">365-Day Shine Warranty</p>
                <p className="text-[#777777] mt-1">If your Shipine jewellery loses its gold luster under normal wear within one year, we replace it free of charge.</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-8">
            <button
              onClick={() => setActiveView('shop')}
              className="px-8 py-3.5 bg-[#242424] text-white hover:bg-[#C5A46D] transition-colors rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <span>Explore The Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  if (page === 'contact') {
    return (
      <div className="bg-[#FAF8F4] min-h-screen py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-semibold">We're Here For You</span>
            <h1 className="font-serif text-4xl font-medium text-[#242424]">Get in Touch</h1>
            <p className="text-xs sm:text-sm text-[#777777]">
              Have questions about styling, delivery, or custom orders? Reach our Bengaluru studio team anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Contact Details */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-6 text-xs">
              <h3 className="font-serif text-xl font-semibold text-[#242424]">Shipine Flagship Studio</h3>
              
              <div className="space-y-4 text-[#777777]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C5A46D] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#242424] block">Studio Address</span>
                    <p>Studio 402, High Street, 100ft Road, Indiranagar, Bengaluru, Karnataka 560038, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#C5A46D] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#242424] block">Email Concierge</span>
                    <p>care@shipine.com</p>
                    <p>orders@shipine.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#C5A46D] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#242424] block">Customer Hotline</span>
                    <p>+91 98765 43210</p>
                    <p className="text-[11px] text-[#A0A0A0]">Mon - Sat: 10:00 AM - 7:00 PM IST</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#FAF8F4] text-[11px] text-[#777777]">
                Official WhatsApp styling consultations available daily.
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDCB] shadow-xs">
              <h3 className="font-serif text-xl font-semibold text-[#242424] mb-4">Send Us a Message</h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Subject</label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D] bg-white"
                  >
                    <option value="Order Inquiry">Order Inquiry & Tracking</option>
                    <option value="Product Sizing">Product Sizing & Plating</option>
                    <option value="Gifting Concierge">Gifting & Bulk Enquiries</option>
                    <option value="Press / Collaboration">Press & Styling Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1">Your Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="How can we assist you today?"
                    className="w-full px-3.5 py-2.5 border border-[#E8DDCB] rounded-xl focus:outline-none focus:border-[#C5A46D]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#242424] hover:bg-[#C5A46D] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Policies & FAQs View
  return (
    <div className="bg-[#FAF8F4] min-h-screen py-12 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#C5A46D] font-semibold">Transparency & Trust</span>
          <h1 className="font-serif text-4xl font-medium text-[#242424]">Policies & FAQs</h1>
          <p className="text-xs sm:text-sm text-[#777777]">
            Everything you need to know about shipping, care, returns, and our anti-tarnish guarantee.
          </p>
        </div>

        <div className="space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-3">
            <h3 className="font-serif text-xl font-semibold text-[#242424]">Shipping & Delivery Policy</h3>
            <div className="text-xs sm:text-sm text-[#777777] space-y-2 leading-relaxed">
              <p>• <b>Free Shipping:</b> We offer complimentary insured express delivery on all orders above ₹999 across all PIN codes in India. For orders below ₹999, a flat shipping charge of ₹99 applies.</p>
              <p>• <b>Dispatch Timeline:</b> Orders placed before 2:00 PM IST are dispatched on the same business day from our Bengaluru fulfillment center.</p>
              <p>• <b>Delivery Times:</b> Metro cities (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Kolkata) typically receive delivery within 1-2 business days. Non-metro regions receive delivery in 3-4 business days via Blue Dart or Delhivery.</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-3">
            <h3 className="font-serif text-xl font-semibold text-[#242424]">7-Day Hassle-Free Returns & Exchanges</h3>
            <div className="text-xs sm:text-sm text-[#777777] space-y-2 leading-relaxed">
              <p>We want you to adore every Shipine piece. If for any reason you are not completely satisfied, you may initiate an exchange or return within 7 calendar days of delivery.</p>
              <p>Items must be in original unworn condition with tags intact in their signature gift pouch. Refunds are processed back to your original payment method (or UPI) within 3-5 business days upon receipt and inspection.</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DDCB] shadow-xs space-y-3">
            <h3 className="font-serif text-xl font-semibold text-[#242424]">Frequently Asked Questions</h3>
            <div className="space-y-4 text-xs text-[#777777]">
              <div>
                <p className="font-semibold text-[#242424]">Can I really wear Shipine jewellery in the shower and gym?</p>
                <p className="mt-1">Yes! All Shipine pieces feature 18K vacuum gold PVD coating over 316L stainless steel. Water, shampoo, sweat, and perfumes will not cause the gold to tarnish, peel, or turn your skin green.</p>
              </div>
              <div>
                <p className="font-semibold text-[#242424]">Is Cash on Delivery (COD) available?</p>
                <p className="mt-1">Yes, Cash on Delivery is available across over 19,000 PIN codes in India. You can inspect the tamper-proof sealed parcel upon delivery.</p>
              </div>
              <div>
                <p className="font-semibold text-[#242424]">What payment modes do you accept?</p>
                <p className="mt-1">We accept UPI (Google Pay, PhonePe, Paytm, BHIM), all Visa/Mastercard/RuPay credit & debit cards, net banking from all Indian banks, and COD.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
