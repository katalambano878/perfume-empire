'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ProductCard, { type ColorVariant, getColorHex } from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import AnimatedSection, { AnimatedGrid } from '@/components/AnimatedSection';
import NewsletterSection from '@/components/NewsletterSection';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Home() {
  usePageTitle('');
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Config State - Managed in Code
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const config: {
    hero: {
      headline: string;
      subheadline: string;
      primaryButtonText: string;
      primaryButtonLink: string;
      secondaryButtonText: string;
      secondaryButtonLink: string;
      backgroundImage?: string;
    };
    banners?: Array<{ text: string; active: boolean }>;
  } = {
    hero: {
      headline: 'The Perfume Empire',
      subheadline: 'Curated fragrances at East Legon, near America House. Wholesale & retail for resellers and customers across Ghana.',
      primaryButtonText: 'Shop Collections',
      primaryButtonLink: '/shop',
      secondaryButtonText: 'Our Story',
      secondaryButtonLink: '/about',
    },
    banners: [
      { text: '🚚 Free delivery on orders over GH₵ 500 within Accra!', active: false },
      { text: '✨ New stock arriving this weekend. Pre-order now!', active: false },
      { text: '💳 Secure payments via Mobile Money & Card', active: false }
    ]
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch featured products directly from Supabase
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, product_variants(*), product_images(*)')
          .eq('status', 'active')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (productsError) throw productsError;
        setFeaturedProducts(productsData || []);

      } catch (error: unknown) {
        const err = error as { message?: string; code?: string };
        const msg = err?.message ?? (error instanceof Error ? error.message : String(error));
        const code = err?.code ?? '';
        if (code === 'PGRST205') {
          console.warn('Products table not found. Run Supabase migrations to create the schema.');
        } else {
          console.error('Error fetching data:', msg, code ? `(${code})` : '');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);


  const getHeroImage = () => {
    if (config.hero.backgroundImage) return config.hero.backgroundImage;
    return "/logo.png";
  };

  const renderBanners = () => {
    const activeBanners = config.banners?.filter(b => b.active) || [];
    if (activeBanners.length === 0) return null;

    return (
      <div className="bg-blue-900 text-white py-2 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {activeBanners.concat(activeBanners).map((banner, index) => (
            <span key={index} className="mx-8 text-sm font-medium tracking-wide flex items-center">
              {banner.text}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-col items-center justify-between min-h-screen">
      {renderBanners()}

      {/* Hero Section - Sleek Interactive Design */}
      <section className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden bg-neutral-900 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl">

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/10">
          <div
            key={currentSlide}
            className="h-full bg-white/80 animate-progress origin-left"
            style={{ animationDuration: '3000ms' }}
          ></div>
        </div>

        {/* Background Slider + Per-Slide Content */}
        {[
          {
            image: '/Whisk_4e28dc6bf0d6be98458435c0c2950e3ddr.jpeg',
            tag: 'New Arrivals',
            heading: <>Premium <br /><span className="italic font-light text-blue-200">Quality Collection</span></>,
            subtext: 'Discover our latest arrivals imported directly for you. Unmatched quality at unbeatable prices.',
            cta: { text: 'Shop Now', href: '/shop' },
            cta2: { text: 'View Catalog', href: '/categories' },
            position: 'object-center'
          },
          {
            image: '/Whisk_50c2f050b440b4b95064c372c1ec7ee1dr.jpeg',
            tag: 'Signature Scents',
            heading: <>Elegance <br /><span className="italic font-light text-rose-200">Redefined</span></>,
            subtext: 'Step into the season with our exclusive fragrance edits. Curated for everyday wear and special occasions.',
            cta: { text: 'Shop Fragrances', href: '/shop' },
            cta2: { text: 'Learn More', href: '/about' },
            position: 'object-top'
          },
          {
            image: '/Whisk_64e2698834d1476801a4b505b30c324bdr.jpeg',
            tag: 'Exclusive Deals',
            heading: <>Limited <br /><span className="italic font-light text-amber-200">Time Offers</span></>,
            subtext: 'Don\'t miss out on our seasonal sale. Great discounts on your favorite items.',
            cta: { text: 'View Offers', href: '/shop?on_sale=true' },
            cta2: { text: 'Contact Us', href: '/contact' },
            position: 'object-center'
          },
        ].map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Image with Ken Burns Effect */}
            <div className={`absolute inset-0 ${index === currentSlide ? 'animate-ken-burns' : ''}`}>
              <Image
                src={slide.image}
                alt={`Hero Banner ${index + 1}`}
                fill
                className={`object-cover ${slide.position}`}
                priority={index === 0}
                quality={82}
                sizes="100vw"
              />
            </div>

            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            {/* Slide Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 md:px-16 max-w-7xl mx-auto h-full mt-[-20px]">
              <div className="max-w-4xl flex flex-col items-center">
                <div
                  className={`overflow-hidden transition-all duration-700 delay-100 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                  <span className="inline-block py-1 px-4 mb-6 text-white/90 text-sm md:text-base tracking-[0.3em] uppercase font-semibold border border-white/20 rounded-full backdrop-blur-md bg-white/5">
                    {slide.tag}
                  </span>
                </div>

                <div className={`transition-all duration-700 delay-200 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif text-white mb-6 leading-[1.1] drop-shadow-2xl">
                    {slide.heading}
                  </h1>
                </div>

                <div className={`transition-all duration-700 delay-300 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                    {slide.subtext}
                  </p>
                </div>

                <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 transition-all duration-700 delay-400 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <Link
                    href={slide.cta.href}
                    className="group relative px-10 py-4 bg-white text-gray-950 rounded-full font-medium text-lg overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:bg-gray-100 hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {slide.cta.text} <i className="ri-arrow-right-line transition-transform group-hover:translate-x-1"></i>
                    </span>
                  </Link>
                  <Link
                    href={slide.cta2.href}
                    className="group px-10 py-4 bg-white/10 border border-white/30 text-white rounded-full font-medium text-lg backdrop-blur-md hover:bg-white/20 hover:border-white/50 transition-all hover:scale-105"
                  >
                    {slide.cta2.text}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 transition-all duration-300 ${currentSlide === i ? 'w-12 bg-white' : 'w-6 bg-white/40 hover:bg-white/60'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Decoration */}
        <div className="absolute bottom-10 right-6 md:right-16 z-20 hidden md:block">
          <div className="text-white/40 text-sm font-light tracking-widest vertical-text transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
            EST. 2026 COLLECTION
          </div>
        </div>

      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="max-w-[1400px] mx-auto">
          <AnimatedSection className="flex items-end justify-between mb-6 md:mb-16 gap-4 px-4 sm:px-6">
            <div>
              <span className="block text-[11px] md:text-sm font-medium tracking-[0.2em] text-gray-500 mb-2 md:mb-3 uppercase">
                Olfactory Families
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl text-gray-900 leading-[1.1]">
                Shop by <span className="italic text-gray-400">Category</span>
              </h2>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <p className="hidden md:block text-gray-500 max-w-xs text-right font-light leading-relaxed">
                Explore our curated collection of fragrances, categorized by their dominant notes.
              </p>
              <Link
                href="/categories"
                className="group flex items-center justify-center w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
                aria-label="View all categories"
              >
                <i className="ri-arrow-right-line text-lg md:text-xl transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimatedSection>

          {/* Mobile: horizontal snap carousel · Desktop: grid */}
          <div
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 px-4 sm:px-6
                       [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                       md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8 md:overflow-visible md:pb-0 md:snap-none"
          >
            {[
              {
                id: 'mens',
                name: "Men's Fragrances",
                subtitle: 'Bold, confident, timeless',
                slug: 'mens',
                image: '/Whisk_4e28dc6bf0d6be98458435c0c2950e3ddr.jpeg',
                tint: 'bg-blue-900',
              },
              {
                id: 'womens',
                name: "Women's Fragrances",
                subtitle: 'Romantic, soft, elegant',
                slug: 'womens',
                image: '/Whisk_50c2f050b440b4b95064c372c1ec7ee1dr.jpeg',
                tint: 'bg-rose-900',
              },
              {
                id: 'unisex',
                name: 'Unisex Collection',
                subtitle: 'For everyone, every mood',
                slug: 'unisex',
                image: '/Whisk_64e2698834d1476801a4b505b30c324bdr.jpeg',
                tint: 'bg-amber-900',
              },
              {
                id: 'oud',
                name: 'Oud Collection',
                subtitle: 'Rich, opulent, lasting',
                slug: 'oud',
                image: '/Whisk_6ec7df94ec3ca85b49644810b7fab2ecdr.jpeg',
                tint: 'bg-stone-900',
              },
              {
                id: 'gift-sets',
                name: 'Gift Sets',
                subtitle: 'Curated for gifting',
                slug: 'gift-sets',
                image: '/Whisk_6f28ce8873000718f834bc0d63e3bc87dr.jpeg',
                tint: 'bg-rose-900',
              },
              {
                id: 'new-arrivals',
                name: 'New Arrivals',
                subtitle: 'Just landed',
                slug: 'new-arrivals',
                image: '/Whisk_835b10a10eab0caa2c7419d4a6e01102dr.jpeg',
                tint: 'bg-blue-900',
              },
            ].map((category) => (
              <Link
                href={`/shop?category=${category.slug}`}
                key={category.id}
                className="group block shrink-0 w-[72vw] max-w-[280px] snap-center
                           sm:w-[58vw] sm:max-w-[320px]
                           md:w-auto md:max-w-none md:shrink"
              >
                <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden isolate bg-gray-900 shadow-xl md:shadow-2xl rounded-2xl md:rounded-3xl">
                  <div className="absolute inset-0 transition-transform duration-[1500ms] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 72vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-85" />
                  <div className={`absolute inset-0 ${category.tint} mix-blend-overlay opacity-40 group-hover:opacity-50 transition-opacity duration-700`} />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent opacity-60" />

                  <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end z-10">
                    <div className="absolute top-5 right-5 md:top-8 md:right-8 overflow-hidden">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-[9px] md:text-[10px] font-bold text-white tracking-widest uppercase md:translate-y-[-150%] md:opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        Explore <i className="ri-arrow-right-line" />
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl md:text-4xl lg:text-5xl text-white leading-[0.95] mb-2 md:mb-3 drop-shadow-xl transition-transform duration-700 group-hover:-translate-y-1">
                      {category.name}
                    </h3>

                    <div className="h-px w-10 md:w-12 bg-white/60 mb-2.5 md:mb-4 transition-all duration-700 group-hover:w-full group-hover:bg-white/90" />

                    <p className="text-white/75 font-light text-[11px] md:text-sm tracking-[0.15em] uppercase md:translate-y-full md:opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
                      {category.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <p className="md:hidden text-center text-[11px] text-gray-400 tracking-wide mt-1 px-4">
            Swipe to browse <i className="ri-arrow-right-s-line align-middle" />
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">Curated Picks</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-gray-900 mt-3 mb-4">Featured Products</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Top picks from our latest arrivals</p>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {featuredProducts.map((product) => {
                const variants = product.product_variants || [];
                const hasVariants = variants.length > 0;
                const minVariantPrice = hasVariants ? Math.min(...variants.map((v: any) => v.price || product.price)) : undefined;
                const totalVariantStock = hasVariants ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) : 0;
                const effectiveStock = hasVariants ? totalVariantStock : product.quantity;

                // Extract unique colors from option2
                const colorVariants: ColorVariant[] = [];
                const seenColors = new Set<string>();
                for (const v of variants) {
                  const colorName = (v as any).option2;
                  if (colorName && !seenColors.has(colorName.toLowerCase().trim())) {
                    const hex = getColorHex(colorName);
                    if (hex) {
                      seenColors.add(colorName.toLowerCase().trim());
                      colorVariants.push({ name: colorName.trim(), hex });
                    }
                  }
                }

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.compare_at_price}
                    image={product.product_images?.[0]?.url || 'https://via.placeholder.com/400x500'}
                    rating={product.rating_avg || 5}
                    reviewCount={product.review_count || 0}
                    badge={product.featured ? 'Featured' : undefined}
                    inStock={effectiveStock > 0}
                    maxStock={effectiveStock || 50}
                    moq={product.moq || 1}
                    hasVariants={hasVariants}
                    minVariantPrice={minVariantPrice}
                    colorVariants={colorVariants}
                  />
                );
              })}
            </AnimatedGrid>
          )}

          <div className="text-center mt-16">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story Teaser */}
      <section className="py-20 md:py-28 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <AnimatedSection>
            <span className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">Our Philosophy</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mt-3 mb-6 leading-tight">
              More than a scent, an <span className="italic text-gray-500">experience</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              The Perfume Empire is built on a belief that fragrance should feel personal and premium. From East Legon, we bring you a curated selection of authentic perfumes for every moment, wholesale and retail.
            </p>
            <Link href="/about" className="inline-block mt-8 text-gray-900 font-medium border-b border-gray-900 pb-1 hover:opacity-70 transition-opacity">
              Read our story
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <span className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">Kind Words</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mt-3">What our customers say</h2>
          </AnimatedSection>
          <AnimatedGrid className="grid md:grid-cols-3 gap-8">
            {[
              { quote: 'Quality and packaging are top-notch. Will definitely order again.', name: 'Ama K.', role: 'Retail customer' },
              { quote: 'Best wholesale prices I\'ve found. Fast delivery and genuine products.', name: 'David M.', role: 'Reseller' },
              { quote: 'The fragrances last all day. Exactly what I was looking for.', name: 'Sarah T.', role: 'Customer' }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-2xl bg-stone-50/80 border border-gray-100 hover:border-gray-200 transition-colors">
                <p className="text-gray-700 leading-relaxed mb-6 font-light">"{t.quote}"</p>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            ))}
          </AnimatedGrid>
        </div>
      </section>

      {/* Newsletter - Homepage Only */}
      <NewsletterSection />

    </main>
  );
}
