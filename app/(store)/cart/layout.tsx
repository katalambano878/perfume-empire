import { STORE_PAGE_SEO } from "@/lib/store-pages";

export const metadata = STORE_PAGE_SEO.cart;

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
