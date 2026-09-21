'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const ITEMS = [
  { href: '/', label: 'Home', icon: 'ri-home-5-line', iconActive: 'ri-home-5-fill' },
  { href: '/shop', label: 'Shop', icon: 'ri-store-2-line', iconActive: 'ri-store-2-fill' },
  { href: '/cart', label: 'Cart', icon: 'ri-shopping-bag-3-line', iconActive: 'ri-shopping-bag-3-fill', badge: 'cart' as const },
  { href: '/wishlist', label: 'Wishlist', icon: 'ri-heart-3-line', iconActive: 'ri-heart-3-fill', badge: 'wishlist' as const },
  { href: '/account', label: 'Account', icon: 'ri-user-3-line', iconActive: 'ri-user-3-fill' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const badgeFor = (kind?: 'cart' | 'wishlist') => {
    if (kind === 'cart') return cartCount;
    if (kind === 'wishlist') return wishlistCount;
    return 0;
  };

  return (
    <nav
      className="lg:hidden fixed inset-x-0 bottom-0 z-50"
      aria-label="Mobile navigation"
    >
      <div className="bg-white border-t border-black/10">
        <div className="grid grid-cols-5 px-2 pt-2 pb-[max(0.55rem,env(safe-area-inset-bottom))]">
          {ITEMS.map((item) => {
            const active = isActive(item.href);
            const badge = badgeFor(item.badge);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 min-h-12"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200 ${
                    active ? 'bg-brand text-white' : 'text-ink/40'
                  }`}
                >
                  <i className={`${active ? item.iconActive : item.icon} text-[20px] leading-none`} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-ink text-white text-[10px] font-semibold leading-4 text-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[11px] leading-none font-medium ${
                    active ? 'text-brand' : 'text-ink/45'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
