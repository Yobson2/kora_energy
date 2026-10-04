import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/app/lib/i18n";

/**
 * The language of a public page, from its [lang] segment. proxy.ts only ever
 * routes "en" or "fr" here; anything else (a path the proxy skipped) is a 404.
 */
export async function pageLocale(params: Promise<{ lang: string }>): Promise<Locale> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return lang;
}
