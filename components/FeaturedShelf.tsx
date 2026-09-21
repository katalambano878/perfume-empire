import Link from 'next/link';
import ProductCard, { type ColorVariant, getColorHex } from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/skeletons/ProductCardSkeleton';
import { resolveProductImage } from '@/lib/product-image';

type Product = Record<string, any>;

function mapCard(product: Product, index: number) {
  const variants = product.product_variants || [];
  const hasVariants = variants.length > 0;
  const minVariantPrice = hasVariants
    ? Math.min(...variants.map((v: any) => v.price || product.price))
    : undefined;
  const totalVariantStock = hasVariants
    ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)
    : 0;
  const effectiveStock = hasVariants ? totalVariantStock : product.quantity;
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

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    originalPrice: product.compare_at_price,
    image: resolveProductImage(product.product_images?.[0]?.url),
    rating: product.rating_avg || 0,
    reviewCount: product.review_count || 0,
    badge: product.compare_at_price ? 'Sale' : index === 0 ? 'Best Seller' : undefined,
    inStock: effectiveStock > 0,
    maxStock: effectiveStock || 50,
    moq: product.moq || 1,
    hasVariants,
    minVariantPrice,
    colorVariants,
  };
}

export default function FeaturedShelf({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  const cards = products.map(mapCard);

  return (
    <section className="bg-cream py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand mb-2">
              Featured
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 text-balance">
              On the counter
            </h2>
            <p className="mt-2 text-sm md:text-base text-neutral-500 max-w-md text-pretty">
              Bottles from the East Legon shop.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-light transition-colors"
          >
            View the shelf <i className="ri-arrow-right-line" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <p className="text-neutral-500 py-8">Products will appear here once the catalogue is loaded.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {cards.map((card) => (
              <ProductCard key={card.id} {...card} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
