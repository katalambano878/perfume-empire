import Link from 'next/link';
import Image from 'next/image';

const TILES = [
  {
    href: '/contact',
    title: 'Smell it in the shop',
    text: 'East Legon, near America House.',
    cta: 'Visit us',
    image: '/Whisk_a4071984faa45f6b45b4ac8f2119754ddr.jpeg',
    bg: 'bg-brand',
    fg: 'text-white',
    muted: 'text-white/75',
    btn: 'bg-white text-brand hover:bg-white/90',
  },
  {
    href: '/shop?search=oud',
    title: 'Oud & Arabian',
    text: 'The house signature scents.',
    cta: 'Shop oud',
    image: '/Whisk_4e28dc6bf0d6be98458435c0c2950e3ddr.jpeg',
    bg: 'bg-white border border-black/10',
    fg: 'text-ink',
    muted: 'text-ink/60',
    btn: 'bg-brand text-white hover:bg-brand-dark',
  },
  {
    href: '/shop?search=gift',
    title: 'Gift sets',
    text: 'Ready to wrap for someone.',
    cta: 'Shop gifts',
    image: '/Whisk_a23750058b309cf9155424b5e8ea85dcdr.jpeg',
    bg: 'bg-brand-accent',
    fg: 'text-white',
    muted: 'text-white/85',
    btn: 'bg-white text-neutral-900 hover:bg-white/90',
  },
] as const;

export default function PromoTiles() {
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {TILES.map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              className={`group relative overflow-hidden rounded-[1.75rem] ${tile.bg} ${tile.fg} min-h-[200px] md:min-h-[220px] px-6 py-6 md:px-7 md:py-7 flex flex-col justify-between`}
            >
              <div className="relative z-10 max-w-[58%]">
                <h3 className="text-xl md:text-[1.35rem] font-semibold tracking-tight leading-snug text-balance">
                  {tile.title}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed text-pretty ${tile.muted}`}>
                  {tile.text}
                </p>
              </div>
              <span
                className={`relative z-10 mt-5 inline-flex items-center gap-1.5 self-start rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${tile.btn}`}
              >
                {tile.cta} <i className="ri-arrow-right-line" />
              </span>
              <span className="pointer-events-none absolute right-[-8%] bottom-[-6%] w-[58%] h-[86%]">
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  className="object-contain object-bottom mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 22vw"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
