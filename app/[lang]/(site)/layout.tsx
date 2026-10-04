import { ConceptBanner } from "@/app/components/nav/concept-banner";
import { SiteFooter } from "@/app/components/nav/site-footer";
import { SiteHeader } from "@/app/components/nav/site-header";
import { OrganizationJsonLd } from "@/app/components/seo/json-ld";
import type { Locale } from "@/app/lib/i18n";
import { pageLocale } from "@/app/lib/route-locale";

const SKIP: Record<Locale, string> = { en: "Skip to content", fr: "Aller au contenu" };

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const locale = await pageLocale(params);
  return (
    <>
      <a
        href="#main"
        className="bg-sun text-ink sr-only z-50 rounded-[var(--radius-sm)] px-4 py-2 font-semibold focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3"
      >
        {SKIP[locale]}
      </a>
      <ConceptBanner locale={locale} />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter locale={locale} />
      <OrganizationJsonLd locale={locale} />
    </>
  );
}
