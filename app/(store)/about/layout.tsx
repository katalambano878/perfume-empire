import { STORE_PAGE_SEO } from "@/lib/store-pages";

export const metadata = STORE_PAGE_SEO.about;

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
