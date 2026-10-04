import type { Metadata } from "next";
import { siteConfig } from "./site";
import { LOCALES, LOCALE_REGION, localizePath, type Locale } from "./i18n";

type PageMeta = {
  title: string;
  description: string;
  /** Language-free path beginning with "/". Becomes the canonical URL in `locale`. */
  path: string;
  locale: Locale;
  noIndex?: boolean;
};

/** The page in every language, for <link rel="alternate" hreflang>. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(path, l)])),
    "x-default": path,
  };
}

/**
 * Per-page metadata with a canonical URL, its translations, and matching Open
 * Graph / Twitter fields. The OG image itself comes from app/opengraph-image.tsx.
 */
export function pageMetadata({ title, description, path, locale, noIndex }: PageMeta): Metadata {
  const url = localizePath(path, locale);
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      url,
      title: `${title} | ${siteConfig.name}`,
      description,
      siteName: siteConfig.name,
      locale: LOCALE_REGION[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_REGION[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
