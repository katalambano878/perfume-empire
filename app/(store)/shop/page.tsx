'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { usePageTitle } from '@/hooks/usePageTitle';
import ProductCard, { type ColorVariant } from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { getColorHex } from '@/components/ProductCard';
import { db } from '@/lib/db/http-client';
import { cachedQuery } from '@/lib/query-cache';
import { resolveProductImage } from '@/lib/product-image';

function ShopContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const productsPerPage = 9;

  const activeCat = categories.find((c) => c.slug === selectedCategory);
  const pageTitle = search ? search : activeCat?.name || 'Shop';
  const pageLead = search
    ? 'Bottles that match your search.'
    : activeCat
      ? `The ${activeCat.name.toLowerCase()} shelf from East Legon.`
      : 'Every bottle on the East Legon counter — wholesale and retail.';

  usePageTitle(search ? search : activeCat?.name || 'Shop');

  useEffect(() => {
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    if (category) setSelectedCategory(category);
    if (sort) setSortBy(sort);
  }, [searchParams]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/storefront/categories');
        if (res.ok) {
          const data = await res.json();
          if (data) setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const cacheKey = `shop:${selectedCategory}:${search}:${priceRange.join('-')}:${selectedRating}:${sortBy}:${page}`;

        const { data, count, error } = await cachedQuery<{ data: any; count: any; error: any }>(
          cacheKey,
          async () => {
            let query = db
              .from('products')
              .select(
                `
                *,
                categories!inner(name, slug),
                product_images(url, position),
                product_variants(id, name, price, quantity, option1, option2, image_url)
              `,
                { count: 'exact' }
              );

            if (search) {
              query = query.ilike('name', `%${search}%`);
            }

            if (selectedCategory !== 'all') {
              const categoryObj = categories.find((c) => c.slug === selectedCategory);
              if (categoryObj) {
                const targetSlugs = [selectedCategory];
                const childSlugs = categories
                  .filter((c) => c.parent_id === categoryObj.id)
                  .map((c) => c.slug);
                targetSlugs.push(...childSlugs);
                query = query.in('categories.slug', targetSlugs);
              } else {
                query = query.eq('categories.slug', selectedCategory);
              }
            }

            if (priceRange[1] < 5000) {
              query = query.gte('price', priceRange[0]).lte('price', priceRange[1]);
            }

            if (selectedRating > 0) {
              query = query.gte('rating_avg', selectedRating);
            }

            switch (sortBy) {
              case 'price-low':
                query = query.order('price', { ascending: true });
                break;
              case 'price-high':
                query = query.order('price', { ascending: false });
                break;
              case 'rating':
                query = query.order('rating_avg', { ascending: false });
                break;
              case 'new':
                query = query.order('created_at', { ascending: false });
                break;
              case 'popular':
              default:
                query = query.order('created_at', { ascending: false });
                break;
            }

            const from = (page - 1) * productsPerPage;
            const to = from + productsPerPage - 1;
            query = query.range(from, to);

            return query as any;
          },
          2 * 60 * 1000
        );

        if (error) throw error;

        if (data) {
          const formattedProducts = data.map((p: any) => {
            const variants = p.product_variants || [];
            const hasVariants = variants.length > 0;
            const minVariantPrice = hasVariants
              ? Math.min(...variants.map((v: any) => v.price || p.price))
              : undefined;
            const totalVariantStock = hasVariants
              ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)
              : 0;
            const effectiveStock = hasVariants ? totalVariantStock : p.quantity;
            const colorVariants: ColorVariant[] = [];
            const seenColors = new Set<string>();
            for (const v of variants) {
              const colorName = v.option2;
              if (colorName && !seenColors.has(colorName.toLowerCase().trim())) {
                const hex = getColorHex(colorName);
                if (hex) {
                  seenColors.add(colorName.toLowerCase().trim());
                  colorVariants.push({ name: colorName.trim(), hex });
                }
              }
            }

            const sortedImages = (p.product_images || [])
              .slice()
              .sort((a: { position?: number }, b: { position?: number }) => (a.position ?? 0) - (b.position ?? 0));
            return {
              id: p.id,
              slug: p.slug,
              name: p.name,
              price: p.price,
              originalPrice: p.compare_at_price,
              image: resolveProductImage(sortedImages[0]?.url),
              rating: p.rating_avg || 0,
              reviewCount: 0,
              badge: p.compare_at_price > p.price ? 'Sale' : undefined,
              inStock: effectiveStock > 0,
              maxStock: effectiveStock || 50,
              moq: p.moq || 1,
              category: p.categories?.name,
              hasVariants,
              minVariantPrice,
              colorVariants,
            };
          });
          setProducts(formattedProducts);
          setTotalProducts(count || 0);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, priceRange, selectedRating, sortBy, page, search, categories]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const parents = categories.filter((c) => !c.parent_id);
  const chips = [{ id: 'all', slug: 'all', name: 'All' }, ...parents];

  const pickCategory = (slug: string) => {
    setSelectedCategory(slug);
    setPage(1);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 5000]);
    setSelectedRating(0);
    setPage(1);
  };

  const filterPanel = (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-dark mb-3">
          Categories
        </p>
        <div className="space-y-1">
          {chips.map((chip) => {
            const on = selectedCategory === chip.slug;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => pickCategory(chip.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  on ? 'bg-brand text-white font-medium' : 'text-neutral-600 hover:bg-cream-dark hover:text-ink'
                }`}
              >
                {chip.name}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-dark mb-3">
          Up to GH₵{priceRange[1]}
        </p>
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={priceRange[1]}
          onChange={(e) => {
            setPriceRange([0, parseInt(e.target.value, 10)]);
            setPage(1);
          }}
          className="w-full accent-brand"
        />
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-dark mb-3">
          Rating
        </p>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => {
                setSelectedRating(rating === selectedRating ? 0 : rating);
                setPage(1);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                selectedRating === rating ? 'bg-brand text-white' : 'text-neutral-600 hover:bg-cream-dark'
              }`}
            >
              {rating}+ stars
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={clearFilters} className="text-sm font-semibold text-brand hover:underline">
        Clear filters
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <section className="relative min-h-[48svh] overflow-hidden bg-ink">
        <Image
          src="/Whisk_6ec7df94ec3ca85b49644810b7fab2ecdr.jpeg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/20" />
        <div className="relative min-h-[48svh] max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-12 md:pb-16 pt-28">
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-gold">
            East Legon · Accra
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-white text-balance">
            {pageTitle}
          </h1>
          <p className="mt-4 max-w-lg text-white/80 leading-relaxed text-pretty">{pageLead}</p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[220px_minmax(0,1fr)] gap-10">
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-24 rounded-2xl bg-cream border border-cream-dark p-5">
              {filterPanel}
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-dark">
                  On the counter
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {loading ? 'Loading…' : `${totalProducts} ${totalProducts === 1 ? 'bottle' : 'bottles'}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 rounded-full border border-cream-dark px-4 py-2 text-sm font-medium text-ink"
              >
                <i className="ri-equalizer-line" />
                Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="rounded-full border border-cream-dark bg-white px-4 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="popular">Newest</option>
                <option value="new">Just added</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Highest rated</option>
              </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-cream-dark bg-cream px-6 py-16 text-center">
                <p className="font-serif text-2xl text-ink">No bottles on this shelf.</p>
                <p className="mt-2 text-neutral-500">Try another category or clear the filters.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center rounded-full bg-brand text-white px-5 py-2.5 text-sm font-semibold"
                >
                  Show all
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5" data-product-shop>
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-10 w-10 rounded-full border border-cream-dark bg-white disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <i className="ri-arrow-left-s-line text-xl" />
                </button>
                <span className="text-sm text-neutral-500">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-10 w-10 rounded-full border border-cream-dark bg-white disabled:opacity-40"
                  aria-label="Next page"
                >
                  <i className="ri-arrow-right-s-line text-xl" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-gold">
              The shop
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl leading-[1.15] text-balance">
              Smell it before you buy.
            </h2>
            <p className="mt-3 max-w-md text-white/70 leading-relaxed">
              East Legon, near America House. WhatsApp 055 396 7658 if you want a bottle set aside or sent.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/233553967658"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light transition-colors"
            >
              <i className="ri-whatsapp-line" />
              WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:border-gold hover:text-gold transition-colors"
            >
              Visit us
            </Link>
          </div>
        </div>
      </section>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close filters" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-ink">Filters</h2>
              <button type="button" onClick={() => setIsFilterOpen(false)} aria-label="Close" className="p-2">
                <i className="ri-close-line text-2xl" />
              </button>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="mt-8 w-full rounded-full bg-brand py-3 text-sm font-semibold text-white"
            >
              Show bottles
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
