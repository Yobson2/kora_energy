import type { Metadata } from "next";
import { siteConfig } from "./site";

type PageMeta = {
  title: string;
  description: string;
  /** Path beginning with "/". Becomes the canonical URL. */
  path: string;
  noIndex?: boolean;
};

/**
 * Per-page metadata with a canonical URL and matching Open Graph / Twitter
 * fields. The OG image itself comes from app/opengraph-image.tsx.
 */
export function pageMetadata({ title, description, path, noIndex }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      title: `${title} | ${siteConfig.name}`,
      description,
      siteName: siteConfig.name,
      locale: "en",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
