import { STORE_PAGE_SEO } from "@/lib/store-pages";
import { STORE_FAQS } from "@/lib/faqs";
import { faqJsonLd } from "@/lib/seo";

export const metadata = STORE_PAGE_SEO.faqs;

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd([...STORE_FAQS])),
        }}
      />
      {children}
    </>
  );
}
