"use client";

import Link from 'next/link';
import { useCMS } from '@/context/CMSContext';

export default function Footer() {
  const { getSetting } = useCMS();

  const siteName = getSetting('site_name') || 'The Perfume Empire';
  const contactPhone = getSetting('contact_phone') || '0553967658';
  const contactEmail = getSetting('contact_email') || 'tiwaperfumestyle@gmail.com';
  const contactAddress = getSetting('contact_address') || 'East Legon, near America House';
  const socialFacebook = getSetting('social_facebook') || '';
  const socialInstagram = getSetting('social_instagram') || '';
  const socialTwitter = getSetting('social_twitter') || '';
  const socialTiktok = getSetting('social_tiktok') || '';
  const socialSnapchat = getSetting('social_snapchat') || '';
  const socialYoutube = getSetting('social_youtube') || '';

  const socials = [
    { link: socialInstagram, icon: 'ri-instagram-line', label: 'Instagram' },
    { link: socialTiktok, icon: 'ri-tiktok-fill', label: 'TikTok' },
    { link: socialSnapchat, icon: 'ri-snapchat-fill', label: 'Snapchat' },
    { link: socialYoutube, icon: 'ri-youtube-fill', label: 'YouTube' },
    { link: socialTwitter, icon: 'ri-twitter-x-fill', label: 'X' },
    { link: socialFacebook, icon: 'ri-facebook-fill', label: 'Facebook' },
  ].filter((s) => s.link);

  const linkClass =
    'text-neutral-400 hover:text-white transition-colors text-sm';

  return (
    <footer className="bg-neutral-950 text-white border-t border-neutral-800 mt-12 md:mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo-brand.png"
                alt={siteName}
                className="h-11 md:h-14 w-auto max-w-[240px] object-contain object-left"
              />
            </Link>
            <div className="space-y-1 text-sm text-neutral-400">
              <p>{contactAddress}</p>
              <a href={`tel:${contactPhone}`} className="block hover:text-white transition-colors">
                055 396 7658
              </a>
              <a href={`mailto:${contactEmail}`} className="block hover:text-white transition-colors break-all">
                {contactEmail}
              </a>
            </div>
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="text-neutral-400 hover:text-white transition-colors text-lg"
                  >
                    <i className={social.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-medium tracking-wider text-white uppercase mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/shop" className={linkClass}>All Products</Link></li>
              <li><Link href="/categories" className={linkClass}>Collections</Link></li>
              <li><Link href="/shop?category=mens" className={linkClass}>Men&apos;s</Link></li>
              <li><Link href="/shop?category=womens" className={linkClass}>Women&apos;s</Link></li>
              <li><Link href="/shop?sort=newest" className={linkClass}>New Arrivals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-medium tracking-wider text-white uppercase mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/contact" className={linkClass}>Contact</Link></li>
              <li><Link href="/order-tracking" className={linkClass}>Track Order</Link></li>
              <li><Link href="/shipping" className={linkClass}>Shipping</Link></li>
              <li><Link href="/returns" className={linkClass}>Returns</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-medium tracking-wider text-white uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className={linkClass}>Our Story</Link></li>
              <li><Link href="/privacy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <p className="text-neutral-600">East Legon, Accra</p>
        </div>
      </div>
    </footer>
  );
}
