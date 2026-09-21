'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/http-client';
import NewsletterSection from '@/components/NewsletterSection';
import ScentDesk from '@/components/ScentDesk';
import FeaturedShelf from '@/components/FeaturedShelf';
import PromoTiles from '@/components/PromoTiles';
import HeroSlider from '@/components/HeroSlider';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Home() {
  usePageTitle('');
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const featured = await db
          .from('products')
          .select('*, product_variants(*), product_images(*)')
          .eq('status', 'active')
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (featured.error) throw featured.error;
        let rows = featured.data || [];

        if (rows.length < 8) {
          const latest = await db
            .from('products')
            .select('*, product_variants(*), product_images(*)')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(8);
          if (!latest.error && latest.data?.length) {
            const seen = new Set(rows.map((p: any) => p.id));
            rows = [...rows, ...latest.data.filter((p: any) => !seen.has(p.id))].slice(0, 8);
          }
        }

        setFeaturedProducts(rows);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Error fetching featured products:', msg);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <main className="bg-cream">
      <HeroSlider />

      <ScentDesk />

      <FeaturedShelf products={featuredProducts} loading={loading} />

      <PromoTiles />

      <NewsletterSection />
    </main>
  );
}
