'use client';

import { useState } from 'react';
import Link from 'next/link';
import LazyImage from './LazyImage';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { resolveProductImage } from '@/lib/product-image';

// Map common color names to hex values for swatches
const COLOR_MAP: Record<string, string> = {
  black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6',
  navy: '#1E3A5F', green: '#22C55E', yellow: '#EAB308', orange: '#F97316',
  pink: '#EC4899', purple: '#A855F7', brown: '#92400E', beige: '#D4C5A9',
  grey: '#6B7280', gray: '#6B7280', cream: '#FFFDD0', teal: '#14B8A6',
  maroon: '#800000', coral: '#FF7F50', burgundy: '#800020', olive: '#808000',
  tan: '#D2B48C', khaki: '#C3B091', charcoal: '#36454F', ivory: '#FFFFF0',
  gold: '#FFD700', silver: '#C0C0C0', rose: '#FF007F', lavender: '#E6E6FA',
  mint: '#98FB98', peach: '#FFDAB9', wine: '#722F37', denim: '#1560BD',
  nude: '#E3BC9A', camel: '#C19A6B', sage: '#BCB88A', rust: '#B7410E',
  mustard: '#FFDB58', plum: '#8E4585', lilac: '#C8A2C8', stone: '#928E85',
  sand: '#C2B280', taupe: '#483C32', mauve: '#E0B0FF', sky: '#87CEEB',
  forest: '#228B22', cobalt: '#0047AB', emerald: '#50C878', scarlet: '#FF2400',
  aqua: '#00FFFF', turquoise: '#40E0D0', indigo: '#4B0082', crimson: '#DC143C',
  magenta: '#FF00FF', cyan: '#00FFFF', chocolate: '#7B3F00', coffee: '#6F4E37',
};

export function getColorHex(colorName: string): string | null {
  const lower = colorName.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  // Try partial match (e.g. "Light Blue" -> "blue")
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export interface ColorVariant {
  name: string;
  hex: string;
}

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
  maxStock?: number;
  moq?: number;
  hasVariants?: boolean;
  minVariantPrice?: number;
  colorVariants?: ColorVariant[];
  /** Optional scent notes for hover reveal (e.g. "Bergamot, Jasmine, Sandalwood") */
  scentNotes?: string;
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
  rating = 5,
  reviewCount = 0,
  badge,
  inStock = true,
  maxStock = 50,
  moq = 1,
  hasVariants = false,
  minVariantPrice,
  colorVariants = [],
  scentNotes
}: ProductCardProps) {
  const { addToCart } = useCart();
  const wishlist = useWishlist();
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [hoverScent, setHoverScent] = useState(false);
  const displayImage = resolveProductImage(image);
  const displayPrice = hasVariants && minVariantPrice ? minVariantPrice : price;
  const discount = originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;
  const MAX_SWATCHES = 5;
  const isWishlisted = wishlist?.isInWishlist(id) ?? false;

  const formatPrice = (val: number) => `GH\u20B5${val.toFixed(2)}`;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) wishlist?.removeFromWishlist(id);
    else wishlist?.addToWishlist({ id, name, price, originalPrice, image, rating, reviewCount, badge, inStock, slug });
  };

  const label = discount > 0 ? 'Sale' : badge;
  const stars = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-white">
      <Link
        href={`/product/${slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-[#f7f7f7]"
        onMouseEnter={() => setHoverScent(true)}
        onMouseLeave={() => setHoverScent(false)}
      >
        <LazyImage
          src={displayImage}
          alt={name}
          className="h-full w-full object-contain object-center p-4 transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {label && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            {label}
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink/50 shadow-sm"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i className={isWishlisted ? 'ri-heart-fill text-brand' : 'ri-heart-line'} />
        </button>

        {scentNotes && (
          <div className={`absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink/80 to-transparent p-4 text-xs text-white transition-opacity duration-300 ${hoverScent ? 'opacity-100' : 'opacity-0'}`}>
            <span className="mb-1 block text-[10px] uppercase tracking-[0.18em] text-white/70">Notes</span>
            {scentNotes}
          </div>
        )}

        {!inStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <Link href={`/product/${slug}`}>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink">
            {name}
          </h3>
        </Link>

        <div className="mt-2">
          {hasVariants && minVariantPrice ? (
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink/40">From</p>
          ) : null}
          <p className="text-base font-semibold tabular-nums text-ink">{formatPrice(displayPrice)}</p>
          {originalPrice && originalPrice > displayPrice ? (
            <p className="text-xs tabular-nums text-ink/35 line-through">{formatPrice(originalPrice)}</p>
          ) : null}
        </div>

        {reviewCount > 0 && (
          <p className="mt-1.5 flex items-center gap-1 text-[12px] text-ink/70">
            <span className="tracking-tight text-brand" aria-hidden="true">
              {'★'.repeat(stars)}
              <span className="text-ink/20">{'★'.repeat(5 - stars)}</span>
            </span>
            <span className="text-ink/40">({reviewCount})</span>
          </p>
        )}

        {colorVariants.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            {colorVariants.slice(0, MAX_SWATCHES).map((color) => (
              <button
                key={color.name}
                type="button"
                title={color.name}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveColor(activeColor === color.name ? null : color.name);
                }}
                className={`h-3.5 w-3.5 rounded-full border ${
                  activeColor === color.name ? 'ring-2 ring-brand ring-offset-1' : 'border-black/10'
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        )}

        <div className="mt-auto pt-3">
          {hasVariants ? (
            <Link
              href={`/product/${slug}`}
              className="flex w-full items-center justify-center rounded-full bg-ink py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand"
            >
              Select options
            </Link>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addToCart({ id, name, price, image: displayImage, quantity: moq, slug, maxStock, moq });
              }}
              disabled={!inStock}
              className="flex w-full items-center justify-center rounded-full bg-ink py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-40"
            >
              {inStock ? (moq > 1 ? `Add ${moq} to bag` : 'Add to bag') : 'Out of stock'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
