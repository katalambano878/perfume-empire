"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitStatus('success');
      setEmail('');
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-cream pb-12 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] overflow-hidden rounded-[2rem] bg-brand text-white min-h-[20.5rem] md:min-h-[24rem]">
          <div className="flex flex-col justify-center px-7 py-10 sm:px-10 md:px-12 md:py-14">
            <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-white/55">
              The list
            </p>
            <h3 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-balance">
              Stay close to the shop
            </h3>
            <p className="mt-3 text-white/75 text-sm md:text-base leading-relaxed text-pretty max-w-md">
              New bottles, restocks, and a note when something worth smelling arrives in East Legon.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 max-w-lg">
              <div className="flex rounded-full bg-white p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 min-w-0 rounded-full bg-transparent px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="shrink-0 rounded-full bg-brand hover:bg-brand-light text-white font-semibold px-6 py-2.5 text-sm transition-colors duration-200 disabled:opacity-60"
                >
                  {isSubmitting ? '…' : 'Subscribe'}
                </button>
              </div>
              {submitStatus === 'success' ? (
                <p className="mt-3 text-sm text-white/85">You are on the list.</p>
              ) : (
                <p className="mt-3 text-sm text-white/55">
                  Prefer a chat? WhatsApp{' '}
                  <a href="https://wa.me/233553967658" className="text-white underline-offset-2 hover:underline">
                    055 396 7658
                  </a>
                </p>
              )}
            </form>
          </div>

          <div className="relative min-h-[16rem] lg:min-h-full">
            <Image
              src="/Whisk_835b10a10eab0caa2c7419d4a6e01102dr.jpeg"
              alt="Fragrances from The Perfume Empire"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand/50 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-brand/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
