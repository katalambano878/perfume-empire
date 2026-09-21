import { STORE_PAGE_SEO } from "@/lib/store-pages";

export const metadata = STORE_PAGE_SEO.returns;

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
