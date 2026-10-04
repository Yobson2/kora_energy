import type { Metadata, Viewport } from "next";
import { RootDocument } from "@/app/components/root-document";
import { DEFAULT_LOCALE, isLocale, LOCALES, LOCALE_REGION } from "@/app/lib/i18n";
import { siteConfig, siteCopy } from "@/app/lib/site";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const copy = siteCopy(isLocale(lang) ? lang : DEFAULT_LOCALE);
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} | ${copy.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: copy.description,
    applicationName: siteConfig.name,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: LOCALE_REGION[isLocale(lang) ? lang : DEFAULT_LOCALE],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout of the public site. It owns <html>, so `lang` is right in the
 * first byte of every page. An unknown segment falls back to English here and
 * is turned into a 404 by the page (a layout cannot render not-found for itself).
 */
export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  return <RootDocument lang={isLocale(lang) ? lang : DEFAULT_LOCALE}>{children}</RootDocument>;
}
