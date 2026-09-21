'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCMS } from '@/context/CMSContext';
import { usePageTitle } from '@/hooks/usePageTitle';

const WAYS = [
  {
    kicker: '01',
    title: 'Walk in',
    text: 'Smell a bottle at the counter before you buy. The shop is in East Legon, near America House.',
  },
  {
    kicker: '02',
    title: 'Wholesale',
    text: 'Stock a stall or shop from the same counter. Designer and niche bottles at reseller prices.',
  },
  {
    kicker: '03',
    title: 'Send it',
    text: 'WhatsApp 055 396 7658 and we pack a bottle for delivery across Accra and Ghana.',
  },
];

export default function AboutPage() {
  usePageTitle('Our Story');
  const { getSetting } = useCMS();
  const siteName = getSetting('site_name') || 'The Perfume Empire';
  const phone = getSetting('contact_phone') || '0553967658';
  const address = getSetting('contact_address') || 'East Legon, near America House';
  const displayPhone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  const tel = phone.startsWith('0') ? `+233${phone.slice(1)}` : phone;
  const wa = phone.replace(/[^0-9]/g, '');
  const waLink = wa.startsWith('0') ? `https://wa.me/233${wa.slice(1)}` : `https://wa.me/${wa}`;

  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-[72svh] overflow-hidden bg-ink">
        <Image
          src="/Whisk_743db4f33bd7ec08b0f46aec28e929cfdr.jpeg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/25" />

        <div className="relative min-h-[72svh] max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-16 md:pb-20 pt-28">
          <div className="flex items-center gap-3">
            <img src="/logo-mark.png" alt="" className="h-10 w-auto" />
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-gold">
              East Legon · Accra
            </p>
          </div>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-white text-balance">
            The shop behind the bottles.
          </h1>
          <p className="mt-5 max-w-lg text-base md:text-lg leading-relaxed text-white/80 text-pretty">
            {siteName} is a real fragrance counter near America House — wholesale and retail, for people who want to smell it first.
          </p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">
              The house
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.12] tracking-tight text-ink text-balance">
              Designer and niche, sold from East Legon.
            </h2>
            <p className="mt-5 text-neutral-600 leading-relaxed text-pretty">
              She stocks authentic bottles for people buying one scent and for traders filling a stall. Oud, florals, woods, and the Arabian notes Accra keeps coming back for.
            </p>
            <p className="mt-4 text-neutral-600 leading-relaxed text-pretty">
              No invented promises. You can walk in, try a fragrance, take it home, or WhatsApp and we send it.
            </p>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-cream">
            <Image
              src="/Whisk_4e28dc6bf0d6be98458435c0c2950e3ddr.jpeg"
              alt="Bottles on the Perfume Empire counter"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-10 md:mb-14">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gold-dark">
              How it works
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl leading-[1.12] tracking-tight text-ink">
              Three ways to buy.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-cream-dark rounded-3xl overflow-hidden border border-cream-dark">
            {WAYS.map((way) => (
              <article key={way.kicker} className="bg-cream p-7 md:p-8">
                <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gold">
                  {way.kicker}
                </p>
                <h3 className="mt-4 font-serif text-2xl text-ink">{way.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{way.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] bg-cream">
              <Image
                src="/Whisk_6ec7df94ec3ca85b49644810b7fab2ecdr.jpeg"
                alt="Fragrance bottles at the shop"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] bg-cream">
              <Image
                src="/Whisk_a4071984faa45f6b45b4ac8f2119754ddr.jpeg"
                alt="Trying a scent at the counter"
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-sm md:text-base text-neutral-500 leading-relaxed">
            The counter is the shop. Come smell what is out today, or ask for a bottle you already wear.
          </p>
        </div>
      </section>

      <section className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-end">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-gold">
              Visit
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl leading-[1.15] text-balance">
              East Legon, near America House.
            </h2>
            <p className="mt-4 max-w-md text-white/70 leading-relaxed">
              {address}. Call or WhatsApp {displayPhone} if you want a bottle set aside or sent.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light transition-colors"
            >
              <i className="ri-whatsapp-line" />
              WhatsApp
            </a>
            <a
              href={`tel:${tel}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:border-gold hover:text-gold transition-colors"
            >
              Call {displayPhone}
            </a>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:border-gold hover:text-gold transition-colors"
            >
              Shop bottles
              <i className="ri-arrow-right-line" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
