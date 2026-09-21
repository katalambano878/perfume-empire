import { STORE_PAGE_SEO } from "@/lib/store-pages";

export const metadata = STORE_PAGE_SEO.shop;

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
