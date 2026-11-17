import React from 'react';
import { ShieldCheck, Droplets, HeartHandshake, Truck } from 'lucide-react';

export const BrandBenefits: React.FC = () => {
  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Anti-Tarnish Finish',
      description: 'Medical-grade 316L stainless steel bonded with 18K gold via physical vapor deposition (PVD). Never darkens or fades.'
    },
    {
      icon: HeartHandshake,
      title: 'Skin-Friendly Materials',
      description: '100% hypoallergenic, nickel-free, and lead-free. Zero discoloration and completely safe for sensitive skin.'
    },
    {
      icon: Droplets,
      title: 'Everyday Luxury',
      description: 'Waterproof and perfume-safe. Wear comfortably in the shower, pool, gym workouts, or during daily chores.'
    },
    {
      icon: Truck,
      title: 'Secure Shopping',
      description: 'Razorpay encrypted payments, full transit insurance, and complimentary express delivery on orders over ₹999.'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F4] border-y border-[#E8DDCB]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E8DDCB] flex items-center justify-center text-[#C5A46D] shadow-sm">
                  <Icon className="w-6 h-6 stroke-[1.5]" />
                </div>
                
                <h3 className="font-serif text-lg font-semibold text-[#242424]">
                  {item.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-[#777777] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
