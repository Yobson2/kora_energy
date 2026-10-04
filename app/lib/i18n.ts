/**
 * The site's two languages and how they appear in addresses.
 *
 * English keeps the unprefixed addresses the site has always had ("/about");
 * French lives under "/fr" ("/fr/about"). Internally every public route sits
 * under app/[lang], and proxy.ts rewrites unprefixed requests to "/en/…", so
 * "/en/…" is never an address a visitor sees.
 *
 * The back office and the API are not localised and are never prefixed.
 */

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Each language's name in that language, for the switcher. */
export const LOCALE_NAME: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

/** For Open Graph and Intl. */
export const LOCALE_REGION: Record<Locale, string> = {
  en: "en_GB",
  fr: "fr_FR",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Paths that belong to no language: never prefixed, never rewritten. */
function isUnlocalised(path: string) {
  return /^\/(api|admin)(\/|$)/.test(path);
}

/**
 * Splits a pathname into its language and the language-free path.
 * "/fr/projects" → { locale: "fr", path: "/projects" }; "/projects" → en.
 *
 * Also accepts the internal "/en/projects": a prerendered English page reads
 * that pathname on the server while the browser shows "/projects", and both
 * must give the same answer or hydration fails.
 */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const match = /^\/(en|fr)(?=\/|$)(.*)$/.exec(pathname);
  if (match) return { locale: match[1] as Locale, path: match[2] || "/" };
  return { locale: DEFAULT_LOCALE, path: pathname || "/" };
}

/**
 * The address of an internal path in a given language. Leaves alone anything
 * that isn't a site page: external links, mail/phone links, fragments, the API
 * and the back office.
 */
export function localizePath(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//") || isUnlocalised(href)) return href;
  if (locale === DEFAULT_LOCALE) return href;
  if (href === "/" || href.startsWith("/?") || href.startsWith("/#")) {
    return `/${locale}${href.slice(1)}`;
  }
  return `/${locale}${href}`;
}

/** The same page in another language, from a visible pathname. */
export function switchLocalePath(pathname: string, to: Locale): string {
  return localizePath(splitLocale(pathname).path, to);
}
