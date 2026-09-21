import { STORE_PAGE_SEO } from "@/lib/store-pages";

export const metadata = STORE_PAGE_SEO.help;

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
