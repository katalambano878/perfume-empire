/** Canonical brand + SEO config. Runtime app origin can be localhost. */

export const SITE = {
  name: "The Perfume Empire",
  shortName: "Perfume Empire",
  domain: "theperfumeempire.store",
  canonicalUrl: "https://theperfumeempire.store",
  tagline: "Premium fragrances in East Legon — wholesale and retail",
  description:
    "Buy authentic designer and niche perfumes in Ghana. The Perfume Empire in East Legon, near America House, supplies wholesale and retail fragrances across Accra. Call or WhatsApp 055 396 7658.",
  keywords: [
    "The Perfume Empire",
    "theperfumeempire.store",
    "perfumes Ghana",
    "buy perfume Accra",
    "East Legon perfume shop",
    "wholesale fragrances Ghana",
    "designer perfume Accra",
    "niche perfume Ghana",
    "America House East Legon",
    "perfume wholesale Accra",
    "authentic perfumes Ghana",
  ],
  phoneDisplay: "055 396 7658",
  phoneE164: "+233553967658",
  email: "hello@theperfumeempire.com",
  instagram: "https://www.instagram.com/Theperfumempire/",
  instagramHandle: "@Theperfumempire",
  tiktok: "https://www.tiktok.com/@Theperfume_empire",
  tiktokHandle: "@Theperfume_empire",
  address: {
    street: "East Legon, near America House",
    locality: "Accra",
    region: "Greater Accra",
    country: "GH",
    countryName: "Ghana",
  },
  geo: {
    latitude: 5.6358,
    longitude: -0.1635,
  },
  currency: "GHS",
  locale: "en_GH",
  language: "en-GH",
} as const;

/** Google-facing origin — always the public store domain. */
export function seoOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SEO_CANONICAL_URL?.replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  return SITE.canonicalUrl;
}

/** Runtime origin for redirects, payments, and local links. */
export function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    SITE.canonicalUrl
  ).replace(/\/+$/, "");
}

export function absoluteUrl(path = "/"): string {
  const origin = seoOrigin();
  if (!path || path === "/") return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
