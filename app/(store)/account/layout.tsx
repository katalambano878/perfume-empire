import { STORE_PAGE_SEO } from "@/lib/store-pages";

export const metadata = STORE_PAGE_SEO.account;

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}
