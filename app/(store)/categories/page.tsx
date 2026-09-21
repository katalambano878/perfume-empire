import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db/server';
import { STORE_PAGE_SEO } from '@/lib/store-pages';

export const metadata = STORE_PAGE_SEO.categories;
export const revalidate = 0;

const COVERS: Record<string, string> = {
  women: '/Whisk_50c2f050b440b4b95064c372c1ec7ee1dr.jpeg',
  womens: '/Whisk_50c2f050b440b4b95064c372c1ec7ee1dr.jpeg',
  men: '/Whisk_a4071984faa45f6b45b4ac8f2119754ddr.jpeg',
  mens: '/Whisk_a4071984faa45f6b45b4ac8f2119754ddr.jpeg',
  oud: '/Whisk_4e28dc6bf0d6be98458435c0c2950e3ddr.jpeg',
  unisex: '/Whisk_6f28ce8873000718f834bc0d63e3bc87dr.jpeg',
  gift: '/Whisk_a23750058b309cf9155424b5e8ea85dcdr.jpeg',
  'gift-sets': '/Whisk_a23750058b309cf9155424b5e8ea85dcdr.jpeg',
};

const NOTES: Record<string, string> = {
  women: 'Florals, vanilla, rose',
  womens: 'Florals, vanilla, rose',
  men: 'Woods, amber, spice',
  mens: 'Woods, amber, spice',
  oud: 'Smoke, leather, resin',
  unisex: 'Citrus, musk, clean',
  gift: 'Ready to wrap',
  'gift-sets': 'Ready to wrap',
};

function coverFor(slug: string, imageUrl?: string | null) {
  const key = slug.toLowerCase();
  if (imageUrl && !imageUrl.includes('placeholder') && !imageUrl.includes('/seed/')) {
    return imageUrl;
  }
  if (COVERS[key]) return COVERS[key];
  const match = Object.entries(COVERS).find(([name]) => key.includes(name));
  return match?.[1] || '/Whisk_4e28dc6bf0d6be98458435c0c2950e3ddr.jpeg';
}

function noteFor(slug: string, description?: string | null) {
  if (description?.trim()) return description.trim();
  const key = slug.toLowerCase();
  if (NOTES[key]) return NOTES[key];
  const match = Object.entries(NOTES).find(([name]) => key.includes(name));
  return match?.[1] || 'Bottles from the East Legon counter.';
}

function isStoragePath(src: string) {
  return src.includes('/storage/v1/') || src.startsWith('/storage/');
}

export default async function CategoriesPage() {
  let rows: { id: string; name: string; slug: string; description?: string | null; image_url?: string | null }[] = [];
  try {
    const { data, error } = await db
      .from('categories')
      .select('id, name, slug, description, image_url')
      .eq('status', 'active')
      .order('position', { ascending: true });
    if (error) {
      console.error('Categories query failed:', error);
    } else {
      rows = data || [];
    }
  } catch (error) {
    console.error('Categories query failed:', error);
  }

  const categories = rows.map((c) => ({
    id: c.id,
    name: c.name,
    href: `/shop?category=${c.slug}`,
    image: coverFor(c.slug, c.image_url),
    note: noteFor(c.slug, c.description),
  }));

  return (
    <div className="min-h-screen bg-cream">
      <section className="relative min-h-[60svh] overflow-hidden bg-ink">
        <Image
          src="/Whisk_6f28ce8873000718f834bc0d63e3bc87dr.jpeg"
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
            The shelves.
          </h1>
          <p className="mt-5 max-w-lg text-base md:text-lg leading-relaxed text-white/80 text-pretty">
            Start with how you wear it — women, men, oud, gifts. New shelves appear here as the shop adds them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-gold-light transition-colors"
            >
              Every bottle
              <i className="ri-arrow-right-line" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-2.5 text-sm font-semibold text-white hover:border-gold hover:text-gold transition-colors"
            >
              Visit the shop
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {categories.length === 0 ? (
            <p className="text-neutral-500 py-12">Categories will appear here once they are added.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="group relative block overflow-hidden rounded-[1.35rem] bg-ink aspect-[3/4]"
                >
                  {isStoragePath(cat.image) ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                  ) : (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <span className="block h-px w-8 bg-gold mb-3" />
                    <span className="block font-serif text-2xl md:text-[1.75rem] leading-tight text-white">
                      {cat.name}
                    </span>
                    <span className="mt-1.5 block text-xs md:text-sm text-white/70 line-clamp-2">
                      {cat.note}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
