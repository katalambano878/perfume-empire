'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCMS } from '@/context/CMSContext';
import { db } from '@/lib/db/http-client';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRecaptcha } from '@/hooks/useRecaptcha';

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  return raw;
}

function waHref(raw: string) {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('0') ? `https://wa.me/233${digits.slice(1)}` : `https://wa.me/${digits}`;
}

function telHref(raw: string) {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('0') ? `tel:+233${digits.slice(1)}` : `tel:${digits}`;
}

const FIELD =
  'w-full px-4 py-3 rounded-xl border border-cream-dark bg-white text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand';

export default function ContactPage() {
  usePageTitle('Contact');
  const { getSetting } = useCMS();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { getToken, verifying } = useRecaptcha();

  const email = getSetting('contact_email') || 'hello@theperfumeempire.com';
  const phone = getSetting('contact_phone') || '0553967658';
  const whatsapp = getSetting('contact_whatsapp') || phone;
  const address = getSetting('contact_address') || 'East Legon, near America House';
  const displayPhone = formatPhone(phone);
  const displayWa = formatPhone(whatsapp);
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Accra`)}`;

  const channels = [
    {
      label: 'WhatsApp',
      value: displayWa,
      href: waHref(whatsapp),
      note: 'Fastest way to ask for a bottle or send one.',
      external: true,
    },
    {
      label: 'Call',
      value: displayPhone,
      href: telHref(phone),
      note: 'The shop line for wholesale and retail.',
      external: false,
    },
    {
      label: 'Email',
      value: email,
      href: `mailto:${email}`,
      note: 'Orders, invoices, and longer notes.',
      external: false,
    },
    {
      label: 'The shop',
      value: address,
      href: maps,
      note: 'Walk in and smell it at the counter.',
      external: true,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const isHuman = await getToken('contact');
    if (!isHuman) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await db.from('contact_submissions').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      if (error) {
        console.log('Note: contact_submissions table may not exist');
      }

      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', payload: formData }),
      }).catch((err) => console.error('Contact notification error:', err));

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setField = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [key]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-[60svh] overflow-hidden bg-ink">
        <Image
          src="/Whisk_835b10a10eab0caa2c7419d4a6e01102dr.jpeg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-ink/25" />
        <div className="relative min-h-[60svh] max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-14 md:pb-20 pt-28">
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-gold">
            East Legon · Accra
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-white text-balance">
            Come to the counter.
          </h1>
          <p className="mt-5 max-w-lg text-base md:text-lg leading-relaxed text-white/80 text-pretty">
            WhatsApp {displayWa}, walk in near America House, or write from here. Same shop either way.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={waHref(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light transition-colors"
            >
              <i className="ri-whatsapp-line" />
              WhatsApp {displayWa}
            </a>
            <a
              href={maps}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-2.5 text-sm font-semibold text-white hover:border-gold hover:text-gold transition-colors"
            >
              Directions
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10 md:mb-12">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand">
              Reach us
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl leading-[1.12] tracking-tight text-ink">
              The shop line.
            </h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              WhatsApp is the desk. Call if you prefer a voice. Come smell a bottle if you are nearby.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            {channels.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="group flex flex-col justify-between min-h-[168px] rounded-[1.5rem] border border-cream-dark bg-cream px-6 py-6 hover:border-brand/30 hover:bg-cream-dark transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-gold-dark">
                    {item.label}
                  </p>
                  <i className="ri-arrow-right-up-line text-neutral-400 group-hover:text-brand" />
                </div>
                <div>
                  <p className="text-lg md:text-xl font-semibold tracking-tight text-ink group-hover:text-brand transition-colors">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{item.note}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-gold-dark">
              Write
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl leading-[1.12] tracking-tight text-ink text-balance">
              Leave a note for the shop.
            </h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              Wholesale lists, a scent you already wear, or a bottle you want sent. If you need it today, WhatsApp is quicker.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-[1.75rem] bg-white border border-cream-dark p-6 md:p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="block text-sm font-medium text-ink mb-2">Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={setField('name')}
                  className={FIELD}
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="block text-sm font-medium text-ink mb-2">Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={setField('phone')}
                  className={FIELD}
                  placeholder="055 396 7658"
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-sm font-medium text-ink mb-2">Email</span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={setField('email')}
                className={FIELD}
                placeholder="you@email.com"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink mb-2">Subject</span>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={setField('subject')}
                className={FIELD}
                placeholder="Wholesale, a bottle, or a delivery"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink mb-2">Message</span>
              <textarea
                name="message"
                required
                rows={6}
                maxLength={500}
                value={formData.message}
                onChange={setField('message')}
                className={`${FIELD} resize-none`}
                placeholder="What do you need from the shop?"
              />
              <span className="mt-1 block text-xs text-neutral-400">{formData.message.length}/500</span>
            </label>

            {submitStatus === 'success' && (
              <p className="rounded-xl bg-brand-muted border border-brand/15 px-4 py-3 text-sm text-brand">
                Received. We will reply from the shop — WhatsApp us if it is urgent.
              </p>
            )}
            {submitStatus === 'error' && (
              <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                The note did not send. WhatsApp {displayWa} instead.
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || verifying}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-full bg-brand text-white px-7 py-3 text-sm font-semibold hover:bg-brand-light transition-colors disabled:opacity-50"
            >
              {isSubmitting || verifying ? 'Sending…' : 'Send to the shop'}
              <i className="ri-arrow-right-line" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
