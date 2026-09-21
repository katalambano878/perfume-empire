"use client";

import Link from 'next/link';
import { useCMS } from '@/context/CMSContext';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const { getSetting } = useCMS();

  const siteName = getSetting('site_name') || 'The Perfume Empire';
  const contactPhone = getSetting('contact_phone') || '0553967658';
  const contactEmail = getSetting('contact_email') || 'hello@theperfumeempire.com';
  const contactAddress = getSetting('contact_address') || 'East Legon, near America House';
  const socialInstagram = getSetting('social_instagram') || 'https://www.instagram.com/Theperfumempire/';
  const socialTiktok = getSetting('social_tiktok') || 'https://www.tiktok.com/@Theperfume_empire';
  const socialFacebook = getSetting('social_facebook') || '';

  const socials = [
    { link: socialInstagram, icon: 'ri-instagram-line', label: 'Instagram' },
    { link: socialTiktok, icon: 'ri-tiktok-fill', label: 'TikTok' },
    { link: socialFacebook, icon: 'ri-facebook-fill', label: 'Facebook' },
  ].filter((s) => s.link);

  const linkClass = 'text-white/65 hover:text-brand transition-colors text-sm';

  return (
    <footer className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center" aria-label={siteName}>
              <BrandLogo markClassName="h-12" />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              Authentic designer and niche perfumes. Wholesale and retail from East Legon, Accra.
            </p>
            <div className="flex flex-wrap gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:bg-brand hover:text-white hover:border-brand transition-colors"
                >
                  <i className={social.icon} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-brand mb-4">Shopping</h4>
            <ul className="space-y-2.5">
              <li><Link href="/shop" className={linkClass}>All products</Link></li>
              <li><Link href="/shop?sort=newest" className={linkClass}>New arrivals</Link></li>
              <li><Link href="/shop?sort=popular" className={linkClass}>Best sellers</Link></li>
              <li><Link href="/categories" className={linkClass}>Categories</Link></li>
              <li><Link href="/shop?category=gift-sets" className={linkClass}>Gift sets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-brand mb-4">Customer care</h4>
            <ul className="space-y-2.5">
              <li><Link href="/shipping" className={linkClass}>Shipping policy</Link></li>
              <li><Link href="/returns" className={linkClass}>Returns</Link></li>
              <li><Link href="/faqs" className={linkClass}>FAQs</Link></li>
              <li><Link href="/order-tracking" className={linkClass}>Track order</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-brand mb-4">About us</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className={linkClass}>Our story</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy policy</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms</Link></li>
              <li>
                <a href={`tel:${contactPhone}`} className={linkClass}>055 396 7658</a>
              </li>
              <li>
                <a href={`mailto:${contactEmail}`} className={linkClass}>{contactEmail}</a>
              </li>
              <li className="text-sm text-white/55">{contactAddress}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/45">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <p className="inline-flex items-center gap-4">
            <span>East Legon, near America House</span>
            <span>WhatsApp 055 396 7658</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
