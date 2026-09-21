import { STORE_PAGE_SEO } from "@/lib/store-pages";

export const metadata = STORE_PAGE_SEO.checkout;

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
