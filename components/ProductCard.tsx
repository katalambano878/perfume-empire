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

  const badgeClass =
    badge === 'Sale' || discount > 0
      ? 'bg-brand-accent text-white'
      : badge === 'Best Seller'
        ? 'bg-brand text-white'
        : 'bg-neutral-900 text-white';

  return (
    <div className="group bg-white rounded-2xl h-full flex flex-col overflow-hidden border border-neutral-100 hover:border-neutral-200 hover:shadow-[0_12px_36px_rgba(15,23,42,0.08)] transition-[border-color,box-shadow] duration-200">
      <Link
        href={`/product/${slug}`}
        className="relative block aspect-square overflow-hidden bg-cream"
        onMouseEnter={() => setHoverScent(true)}
        onMouseLeave={() => setHoverScent(false)}
      >
        <LazyImage
          src={displayImage}
          alt={name}
          className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discount > 0 && (
            <span className="bg-brand-accent text-white text-[10px] uppercase tracking-wide font-bold px-2.5 py-1 rounded-full">
              Sale
            </span>
          )}
          {badge && discount === 0 && (
            <span className={`${badgeClass} text-[10px] uppercase tracking-wide font-bold px-2.5 py-1 rounded-full`}>
              {badge}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-neutral-500 hover:text-rose-500 transition-colors"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i className={isWishlisted ? 'ri-heart-fill text-rose-500' : 'ri-heart-line'} />
        </button>

        {scentNotes && (
          <div className={`absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-xs font-light tracking-wide transition-all duration-500 z-10 ${hoverScent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-medium block mb-1">Notes</span>
            <p className="drop-shadow-sm leading-relaxed">{scentNotes}</p>
          </div>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-20">
            <span className="bg-neutral-900/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold shadow-xl border border-white/10">
              Out of Stock
            </span>
          </div>
        )}

      </Link>

      <div className="flex flex-col flex-grow px-4 pb-4 pt-3 relative z-10">
        <Link href={`/product/${slug}`}>
          <h3 className="text-[15px] font-semibold leading-snug text-neutral-900 mb-1.5 group-hover:text-brand transition-colors line-clamp-2 text-pretty">
            {name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mb-1.5">
          {hasVariants && minVariantPrice ? (
            <span className="text-neutral-900 font-semibold tabular-nums text-sm">From {formatPrice(minVariantPrice)}</span>
          ) : (
            <span className={`font-semibold tabular-nums text-sm ${discount > 0 ? 'text-brand-accent' : 'text-neutral-900'}`}>{formatPrice(price)}</span>
          )}
          {originalPrice && (
            <span className="text-xs text-neutral-400 line-through tabular-nums">{formatPrice(originalPrice)}</span>
          )}
        </div>

        {(rating > 0 || reviewCount > 0) && (
          <div className="flex items-center gap-1 mb-3 text-amber-400 text-xs">
            {'★★★★★'.slice(0, Math.round(Number(rating) || 5)).padEnd(5, '☆').split('').map((s, i) => (
              <span key={i}>{s === '★' ? '★' : '☆'}</span>
            ))}
            {reviewCount > 0 && <span className="text-neutral-400 ml-1">({reviewCount})</span>}
          </div>
        )}

        {colorVariants.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {colorVariants.slice(0, MAX_SWATCHES).map((color) => (
              <button
                key={color.name}
                title={color.name}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveColor(activeColor === color.name ? null : color.name);
                }}
                className={`w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm transition-all duration-300 flex-shrink-0 ${
                  activeColor === color.name ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110' : 'hover:scale-125 hover:shadow-md'
                } ${color.hex === '#FFFFFF' ? 'border-neutral-200' : ''}`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {colorVariants.length > MAX_SWATCHES && (
              <span className="text-[10px] font-medium text-neutral-400 ml-1">+{colorVariants.length - MAX_SWATCHES}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-1">
          {hasVariants ? (
            <Link
              href={`/product/${slug}`}
              className="w-full border border-neutral-200 text-neutral-900 py-2.5 rounded-full text-xs font-semibold hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-1.5"
            >
              <i className="ri-shopping-cart-2-line text-sm" />
              <span>Select options</span>
            </Link>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart({ id, name, price, image: displayImage, quantity: moq, slug, maxStock, moq });
              }}
              disabled={!inStock}
              className="w-full bg-white border border-neutral-200 text-neutral-900 py-2.5 rounded-full text-xs font-semibold hover:bg-brand hover:text-white hover:border-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <i className="ri-shopping-cart-2-line text-sm" />
              <span>{inStock ? (moq > 1 ? `Add ${moq} to cart` : 'Add to cart') : 'Out of stock'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
