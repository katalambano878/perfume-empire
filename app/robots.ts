import { MetadataRoute } from 'next';
import { seoOrigin } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = seoOrigin();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/checkout',
          '/cart',
          '/account/',
          '/pay/',
          '/order-success',
          '/rest/',
          '/storage/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
