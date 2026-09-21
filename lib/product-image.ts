const FALLBACK = '/Whisk_4e28dc6bf0d6be98458435c0c2950e3ddr.jpeg';

export function resolveProductImage(url?: string | null): string {
  if (!url) return FALLBACK;
  if (url.includes('/seed/')) return FALLBACK;
  return url;
}
