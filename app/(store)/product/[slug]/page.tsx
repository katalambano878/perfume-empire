import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { db } from "@/lib/db/server";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { data } = await db
      .from("products")
      .select(
        "name, description, short_description, seo_title, seo_description, product_images(url, position)"
      )
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (!data) {
      return pageMetadata({
        title: "Perfume",
        description: SITE.description,
        path: `/product/${slug}`,
        noindex: true,
      });
    }

    const images = Array.isArray(data.product_images)
      ? [...data.product_images].sort(
          (a: { position?: number }, b: { position?: number }) =>
            (a.position ?? 0) - (b.position ?? 0)
        )
      : [];
    const image = images[0]?.url;

    return pageMetadata({
      title: data.seo_title || data.name,
      description:
        data.seo_description ||
        data.short_description ||
        data.description ||
        `Buy ${data.name} at ${SITE.name} in East Legon, Accra.`,
      path: `/product/${slug}`,
      image: image || "/logo.png",
      keywords: [data.name, "buy perfume Ghana", "perfume East Legon"],
    });
  } catch {
    return pageMetadata({
      title: "Perfume",
      description: SITE.description,
      path: `/product/${slug}`,
    });
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
