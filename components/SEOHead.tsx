import { Metadata } from 'next';
import { SITE, seoOrigin, absoluteUrl } from '@/lib/site';
import { productJsonLd, breadcrumbJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: string;
  category?: string;
  publishedTime?: string;
  author?: string;
  noindex?: boolean;
  path?: string;
}

export function generateMetadata({
  title = `${SITE.name} | Perfumes in East Legon, Accra`,
  description = SITE.description,
  keywords = [],
  ogImage,
  ogType = 'website',
  publishedTime,
  author,
  noindex = false,
  path = '/',
}: SEOProps): Metadata {
  const siteUrl = seoOrigin();
  const defaultOgImage = absoluteUrl('/logo.png');
  const resolvedOgImage = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : absoluteUrl(ogImage)
    : defaultOgImage;
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  const allKeywords = [...new Set([...keywords, ...SITE.keywords])];

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: allKeywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description,
      images: [{ url: resolvedOgImage, width: 1200, height: 630, alt: title }],
      type: ogType === 'article' ? 'article' : 'website',
      siteName: SITE.name,
      locale: SITE.locale,
      url: path === '/' ? siteUrl : absoluteUrl(path),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [resolvedOgImage],
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    alternates: {
      canonical: path === '/' ? siteUrl : absoluteUrl(path),
    },
  };

  if (ogType === 'article' && publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
    };
  }

  return metadata;
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  sku: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
  brand?: string;
  category?: string;
  url?: string;
}) {
  return productJsonLd({
    ...product,
    url: product.url || (typeof window !== 'undefined' ? window.location.href : seoOrigin()),
  });
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return breadcrumbJsonLd(items);
}

export function generateOrganizationSchema() {
  return organizationJsonLd();
}

export function generateWebsiteSchema() {
  return websiteJsonLd();
}

export function StructuredData({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
