'use client';

const DEFAULT_ITEMS = [
  { icon: 'ri-store-2-line', text: 'Visit us in East Legon, near America House' },
  { icon: 'ri-truck-line', text: 'Delivery across Accra and Ghana' },
  { icon: 'ri-shield-check-line', text: 'Authentic designer and niche perfumes' },
  { icon: 'ri-whatsapp-line', text: 'WhatsApp 055 396 7658' },
];

export default function AnnouncementBar() {
  return (
    <div className="bg-brand text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="hidden md:flex items-center justify-center gap-8 py-2 text-[12px] font-medium">
          {DEFAULT_ITEMS.map((item) => (
            <span key={item.text} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <i className={`${item.icon} text-sm opacity-90`} />
              {item.text}
            </span>
          ))}
        </div>
        <div className="md:hidden overflow-hidden py-2">
          <div className="flex animate-marquee whitespace-nowrap text-[12px] font-medium">
            {DEFAULT_ITEMS.concat(DEFAULT_ITEMS).map((item, i) => (
              <span key={`${item.text}-${i}`} className="mx-5 inline-flex items-center gap-1.5">
                <i className={`${item.icon} text-sm`} />
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
