'use client';

import { useState } from 'react';
import Link from 'next/link';
import LazyImage from './LazyImage';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

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

  return (
    <div className="group glass-card rounded-[1.5rem] h-full flex flex-col overflow-hidden relative">
      {/* Soft gradient background mesh behind card */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <Link
        href={`/product/${slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-neutral-100/50 mb-4 rounded-t-[1.5rem]"
        onMouseEnter={() => setHoverScent(true)}
        onMouseLeave={() => setHoverScent(false)}
      >
        <LazyImage
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        />

        {/* Glassmorphic overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />

        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {badge && (
            <span className="bg-white/80 backdrop-blur-md text-neutral-900 border border-white/40 text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm">
              {badge}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-rose-500/90 backdrop-blur-md text-white border border-rose-400/50 text-[9px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center shadow-sm border border-white/50 text-neutral-600 hover:bg-white hover:text-rose-500 hover:border-white hover:shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 md:translate-x-2 md:group-hover:translate-x-0"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i className={isWishlisted ? 'ri-heart-fill text-rose-500' : 'ri-heart-line text-lg'} />
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

        {inStock && (
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hidden lg:block z-20">
            {hasVariants ? (
              <span className="w-full bg-white/90 backdrop-blur-md text-neutral-900 py-3 rounded-full font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 flex items-center justify-center gap-2 text-xs uppercase tracking-widest hover:bg-white transition-colors">
                <i className="ri-list-check text-base" />
                <span>Select Options</span>
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addToCart({ id, name, price, image, quantity: moq, slug, maxStock, moq });
                }}
                className="w-full bg-neutral-900/90 backdrop-blur-md text-white hover:bg-black py-3 rounded-full font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
              >
                <i className="ri-shopping-cart-2-line text-base" />
                <span>{moq > 1 ? `Add ${moq} to Cart` : 'Quick Add'}</span>
              </button>
            )}
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-grow px-5 pb-5 relative z-10">
        <Link href={`/product/${slug}`}>
          <h3 className="font-serif text-[1.1rem] leading-snug text-neutral-900 mb-1.5 group-hover:text-neutral-600 transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>

        {(rating > 0 || reviewCount > 0) && (
          <div className="flex items-center gap-1.5 mb-2.5 text-neutral-400">
            <span className="text-amber-400 text-sm">★</span>
            <span className="text-xs font-medium text-neutral-600">{Number(rating).toFixed(1)}</span>
            {reviewCount > 0 && <span className="text-[11px] text-neutral-400">({reviewCount})</span>}
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

        <div className="flex items-baseline gap-2.5 mb-2 mt-auto">
          {hasVariants && minVariantPrice ? (
            <span className="text-neutral-900 font-semibold tracking-tight text-[15px]">From {formatPrice(minVariantPrice)}</span>
          ) : (
            <span className="text-neutral-900 font-semibold tracking-tight text-[15px]">{formatPrice(price)}</span>
          )}
          {originalPrice && (
            <span className="text-xs text-neutral-400 line-through decoration-neutral-300 font-medium">{formatPrice(originalPrice)}</span>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-200/60 lg:hidden">
          {hasVariants ? (
            <Link
              href={`/product/${slug}`}
              className="w-full bg-white/80 border border-neutral-200/80 text-neutral-900 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-neutral-50 active:bg-neutral-100 transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <i className="ri-list-check text-sm" />
              <span>Select Options</span>
            </Link>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart({ id, name, price, image, quantity: moq, slug, maxStock, moq });
              }}
              disabled={!inStock}
              className="w-full bg-neutral-900 text-white py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {moq > 1 ? `Add ${moq} to Cart` : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
