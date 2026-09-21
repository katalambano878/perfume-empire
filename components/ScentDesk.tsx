import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
  {
    name: "Women's",
    note: 'Florals, vanilla, rose',
    href: '/shop?category=women',
    image: '/Whisk_50c2f050b440b4b95064c372c1ec7ee1dr.jpeg',
  },
  {
    name: "Men's",
    note: 'Woods, amber, spice',
    href: '/shop?search=men',
    image: '/Whisk_a4071984faa45f6b45b4ac8f2119754ddr.jpeg',
  },
  {
    name: 'Oud',
    note: 'Smoke, leather, resin',
    href: '/shop?search=oud',
    image: '/Whisk_4e28dc6bf0d6be98458435c0c2950e3ddr.jpeg',
  },
  {
    name: 'Unisex',
    note: 'Citrus, musk, clean',
    href: '/shop',
    image: '/Whisk_6f28ce8873000718f834bc0d63e3bc87dr.jpeg',
  },
  {
    name: 'Gift sets',
    note: 'Ready to wrap',
    href: '/shop?search=gift',
    image: '/Whisk_a23750058b309cf9155424b5e8ea85dcdr.jpeg',
  },
  {
    name: 'Shop all',
    note: 'The full catalogue',
    href: '/shop',
    image: '/Whisk_835b10a10eab0caa2c7419d4a6e01102dr.jpeg',
  },
];

export default function ScentDesk() {
  return (
    <section className="bg-cream py-14 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-brand mb-2">
              The shop
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 text-balance">
              Shop by category
            </h2>
            <p className="mt-2 text-sm md:text-base text-neutral-500 max-w-md text-pretty">
              Start with how you wear scent, then pick a bottle.
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline self-start sm:self-auto sm:mb-1"
          >
            All categories <i className="ri-arrow-right-line" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group block rounded-2xl border border-neutral-100 bg-white overflow-hidden hover:border-neutral-200 hover:shadow-[0_10px_36px_rgba(15,23,42,0.06)] transition-[border-color,box-shadow] duration-200"
            >
              <span className="relative block aspect-[4/3] bg-cream overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </span>
              <span className="flex items-start justify-between gap-3 px-4 py-3.5 md:px-5 md:py-4">
                <span>
                  <span className="block text-[15px] md:text-base font-semibold text-neutral-900 group-hover:text-brand transition-colors duration-200">
                    {cat.name}
                  </span>
                  <span className="block mt-0.5 text-sm text-neutral-500">{cat.note}</span>
                </span>
                <i className="ri-arrow-right-line text-neutral-300 group-hover:text-brand mt-0.5 transition-colors duration-200" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
