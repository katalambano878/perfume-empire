'use client';

import Link from 'next/link';
import { useCMS } from '@/context/CMSContext';
import PageHero from '@/components/PageHero';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AboutPage() {
  usePageTitle('Our Story');
  const { getSetting } = useCMS();
  const siteName = getSetting('site_name') || 'The Perfume Empire';

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title="Our Story"
        subtitle="East Legon, near America House, where fragrance meets craft."
        backgroundImage="/Whisk_743db4f33bd7ec08b0f46aec28e929cfdr.jpeg"
      />

      {/* Brand Story */}
      <section className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">Brand Story</span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gray-900 mt-3 mb-8 leading-tight">
            More than a scent, an <span className="italic text-gray-500">emotional connection</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            <strong>{siteName}</strong> began with a simple belief: everyone deserves access to premium fragrances without compromise. Based in East Legon, near America House, we curate authentic perfumes for resellers and individual customers across Ghana, combining quality, value, and a personal touch.
          </p>
        </div>
      </section>

      {/* Craftsmanship editorial split */}
      <section className="py-20 md:py-28 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">Craftsmanship</span>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mt-3 mb-6 leading-tight">
                How we create your fragrance experience
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Every bottle we offer is selected with care. We work with trusted sources to bring you genuine fragrances, from fresh and clean to deep and sensual. Our process focuses on authenticity, lasting quality, and fair pricing for both wholesale and retail.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We inspect and verify our stock so you can sell or wear with confidence. No shortcuts, just real perfumes that tell a story.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                <img
                  src="/Whisk_743db4f33bd7ec08b0f46aec28e929cfdr.jpeg"
                  alt={`${siteName} craftsmanship`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredient Philosophy */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">Ingredient Philosophy</span>
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mt-3 mb-8 leading-tight">
            Premium oils & natural ingredients
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We prioritise fragrances that use quality ingredients and lasting formulations. From natural essences to refined synthetics, every scent in our collection is chosen for its character, longevity, and wearability, so you get a premium experience at a fair price.
          </p>
        </div>
      </section>

      {/* Founder Vision */}
      <section className="py-20 md:py-28 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                <img
                  src="/logo.png"
                  alt={siteName}
                  className="w-full h-full object-contain p-12 bg-white"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">Founder Vision</span>
              <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mt-3 mb-6 leading-tight">
                Built on trust and quality
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {siteName} was founded to bridge the gap between premium fragrances and everyday customers and resellers. We believe that great perfume should be accessible, whether you&apos;re building a business or treating yourself.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our vision is simple: offer authentic, lasting fragrances with transparent pricing and reliable service from East Legon to all of Ghana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Experience */}
      <section className="py-20 md:py-28 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">Signature Experience</span>
          <h2 className="font-serif text-3xl md:text-4xl mt-3 mb-8 leading-tight">
            What makes us different
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-12">
            Personal service, verified quality, and a curated range that fits every taste and budget. We&apos;re not just selling bottles. We&apos;re helping you find (or resell) the scent that defines a moment.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <span className="flex items-center gap-2"><i className="ri-check-line text-white/70" /> Authentic products</span>
            <span className="flex items-center gap-2"><i className="ri-check-line text-white/70" /> Wholesale & retail</span>
            <span className="flex items-center gap-2"><i className="ri-check-line text-white/70" /> East Legon, Accra</span>
            <span className="flex items-center gap-2"><i className="ri-check-line text-white/70" /> Nationwide delivery</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-4">Ready to find your scent?</h2>
          <p className="text-gray-600 mb-8">Browse our collection or get in touch. Call <a href="tel:0553967658" className="font-medium text-gray-900 hover:underline">055 396 7658</a>.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Shop now <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </section>
    </div>
  );
}
