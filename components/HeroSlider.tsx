'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SLIDES = [
  {
    image: '/Whisk_6ec7df94ec3ca85b49644810b7fab2ecdr.jpeg',
    kicker: 'East Legon · Accra',
    title: 'Scent better.\nLive better.',
    text: 'Designer and niche bottles, wholesale and retail, from the shop near America House.',
    cta: 'Shop now',
    href: '/shop',
  },
  {
    image: '/Whisk_4e28dc6bf0d6be98458435c0c2950e3ddr.jpeg',
    kicker: 'House signature',
    title: 'Oud &\nArabian.',
    text: 'Smoke, leather, and resin — the scents people come to the counter for.',
    cta: 'Shop oud',
    href: '/shop?search=oud',
  },
  {
    image: '/Whisk_a4071984faa45f6b45b4ac8f2119754ddr.jpeg',
    kicker: 'The shop',
    title: 'Smell it\nbefore you buy.',
    text: 'Walk in, try a bottle, or WhatsApp 055 396 7658 and we will send it across Ghana.',
    cta: 'Visit us',
    href: '/contact',
  },
];

const INTERVAL_MS = 5000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [index]);

  const slide = SLIDES[index];

  return (
    <section className="relative min-h-[68svh] overflow-hidden bg-ink">
      {SLIDES.map((item, i) => (
        <div
          key={item.image}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={item.image}
            alt=""
            fill
            priority={i === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/45 to-ink/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/20" />

      <div className="relative min-h-[68svh] max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-16 md:pb-20 pt-28">
        <p className="text-[11px] md:text-xs font-semibold tracking-[0.28em] uppercase text-brand">
          {slide.kicker}
        </p>
        <h1 className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.05] text-balance whitespace-pre-line">
          {slide.title}
        </h1>
        <p className="mt-5 text-white/80 text-base md:text-lg max-w-lg leading-relaxed text-pretty">
          {slide.text}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={slide.href}
            className="inline-flex items-center gap-2 bg-white text-ink px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand hover:text-white transition-colors duration-200"
          >
            {slide.cta} <i className="ri-arrow-right-line" />
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 border border-white/35 text-white px-6 py-3 rounded-full text-sm font-semibold hover:border-white hover:bg-white/10 transition-colors duration-200"
          >
            Explore categories
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-2" aria-hidden="true">
          {SLIDES.map((item, i) => (
            <span
              key={item.kicker}
              className={`relative h-1.5 rounded-full overflow-hidden bg-white/25 ${
                i === index ? 'w-10' : 'w-5'
              }`}
            >
              {i === index && (
                <span className="absolute inset-0 bg-brand animate-hero-progress" />
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
