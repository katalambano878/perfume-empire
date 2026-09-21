'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MiniCart from './MiniCart';
import { useCart } from '@/context/CartContext';
import { db } from '@/lib/db/http-client';
import { useCMS } from '@/context/CMSContext';
import AnnouncementBar from './AnnouncementBar';
import BrandLogo from './BrandLogo';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Categories', href: '/categories' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const { getSetting } = useCMS();

  const siteName = getSetting('site_name') || 'The Perfume Empire';

  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };

    updateWishlistCount();
    window.addEventListener('wishlistUpdated', updateWishlistCount);

    const checkUser = async () => {
      const { data: { session } } = await db.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUser();

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      window.removeEventListener('wishlistUpdated', updateWishlistCount);
      subscription.unsubscribe();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const iconBtn = 'w-10 h-10 flex items-center justify-center text-neutral-700 hover:text-brand rounded-full transition-colors duration-200';

  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/10">
        <nav aria-label="Main navigation" className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-[64px] md:h-[72px] grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex items-center justify-start gap-1 min-w-0">
                <button
                  type="button"
                  className="lg:hidden w-10 h-10 flex items-center justify-center text-neutral-800 hover:text-brand rounded-full"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <i className="ri-menu-line text-2xl" />
                </button>
                <Link href="/" className="flex items-center shrink-0 min-w-0" aria-label={siteName}>
                  <BrandLogo />
                </Link>
              </div>

              <div className="hidden lg:flex items-center rounded-full bg-brand-muted p-1">
                {NAV.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${
                        active
                          ? 'bg-brand text-white shadow-[0_1px_4px_rgba(196,30,58,0.25)]'
                          : 'text-ink/55 hover:text-brand'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="hidden lg:flex items-center justify-end shrink-0 z-10">
                <div className="flex items-center rounded-full bg-brand-muted px-0.5">
                  <button type="button" className={iconBtn} onClick={() => setIsSearchOpen(true)} aria-label="Search">
                    <i className="ri-search-line text-[19px]" />
                  </button>
                  {user ? (
                    <Link href="/account" className={`${iconBtn} hidden sm:flex`} aria-label="Account">
                      <i className="ri-user-line text-[19px]" />
                    </Link>
                  ) : (
                    <Link href="/auth/login" className={`${iconBtn} hidden sm:flex`} aria-label="Login">
                      <i className="ri-user-line text-[19px]" />
                    </Link>
                  )}
                  <Link href="/wishlist" className={`${iconBtn} relative hidden sm:flex`} aria-label="Wishlist">
                    <i className="ri-heart-line text-[19px]" />
                    {wishlistCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative">
                    <button
                      type="button"
                      className={`${iconBtn} relative`}
                      onClick={() => setIsCartOpen(!isCartOpen)}
                      aria-label="Cart"
                    >
                      <i className="ri-shopping-bag-line text-[19px]" />
                      {cartCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                          {cartCount}
                        </span>
                      )}
                    </button>
                    <MiniCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
                  </div>
                </div>
              </div>
            </div>
        </nav>
      </header>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-start justify-center pt-32 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Search products</h3>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900"
                  aria-label="Close search"
                >
                  <i className="ri-close-line text-2xl" />
                </button>
              </div>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fragrances..."
                    className="w-full px-4 py-3 pr-12 border border-neutral-200 rounded-full focus:ring-2 focus:ring-brand/20 focus:border-brand text-base"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-brand"
                  >
                    <i className="ri-search-line text-xl" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
          <div className="absolute top-0 left-0 bottom-0 w-4/5 max-w-xs bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} aria-label={siteName}>
                <BrandLogo markClassName="h-9" />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-neutral-500"
                aria-label="Close menu"
              >
                <i className="ri-close-line text-2xl" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="px-3 pt-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fragrances..."
                  className="w-full px-4 py-3 pr-12 border border-neutral-200 rounded-full focus:ring-2 focus:ring-brand/20 focus:border-brand text-base"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-brand"
                  aria-label="Search"
                >
                  <i className="ri-search-line text-xl" />
                </button>
              </div>
            </form>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-4 py-3 text-base font-medium rounded-xl ${
                    isActive(link.href) ? 'bg-brand text-white' : 'text-neutral-800 hover:bg-cream'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
