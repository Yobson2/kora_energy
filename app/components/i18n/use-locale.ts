"use client";

import { useParams } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/app/lib/i18n";

/**
 * The page's language, for client components. It is the [lang] route segment,
 * so it is right on the server render and on the client alike. Outside the
 * public site (the back office) there is no segment, and it is English.
 */
export function useLocale(): Locale {
  const { lang } = useParams<{ lang?: string }>();
  return isLocale(lang) ? lang : DEFAULT_LOCALE;
}
