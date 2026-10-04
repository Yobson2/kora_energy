import { ConceptBanner } from "@/app/components/nav/concept-banner";
import { SiteFooter } from "@/app/components/nav/site-footer";
import { SiteHeader } from "@/app/components/nav/site-header";
import { OrganizationJsonLd } from "@/app/components/seo/json-ld";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="bg-sun text-ink sr-only z-50 rounded-[var(--radius-sm)] px-4 py-2 font-semibold focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3"
      >
        Skip to content
      </a>
      <ConceptBanner />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <OrganizationJsonLd />
    </>
  );
}
