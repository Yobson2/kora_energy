"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useLocale } from "@/app/components/i18n/use-locale";
import { LOCALES, LOCALE_NAME, switchLocalePath, type Locale } from "@/app/lib/i18n";
import { cn } from "@/app/lib/utils";

const GROUP_LABEL: Record<Locale, string> = { en: "Language", fr: "Langue" };

/**
 * Links to the same page in each language. Real links (hreflang, lang), so
 * they work without JavaScript, open in a new tab and are announced in the
 * language they lead to.
 *
 * A plain click also carries the query string and fragment across: calculator
 * inputs live in the address (updated with history.replaceState, which the
 * router does not see), and switching language must not lose them.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function go(event: MouseEvent<HTMLAnchorElement>, href: string, target: Locale) {
    if (target === locale) {
      event.preventDefault();
      return;
    }
    // Let modified clicks (new tab, new window) behave as ordinary links.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    router.push(`${href}${window.location.search}${window.location.hash}`);
  }

  return (
    <div
      role="group"
      aria-label={GROUP_LABEL[locale]}
      className={cn(
        "ring-line flex items-center rounded-[var(--radius-sm)] p-0.5 ring-1 ring-inset",
        className
      )}
    >
      {LOCALES.map((l) => {
        const active = l === locale;
        const href = switchLocalePath(pathname, l);
        return (
          <NextLink
            key={l}
            href={href}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            onClick={(e) => go(e, href, l)}
            className={cn(
              "rounded-[var(--radius-xs)] px-2 py-1 text-[0.8125rem] font-semibold tracking-[0.04em] transition-colors",
              active ? "bg-ink text-paper" : "text-muted hover:text-ink"
            )}
          >
            <span aria-hidden>{l.toUpperCase()}</span>
            <span className="sr-only">{LOCALE_NAME[l]}</span>
          </NextLink>
        );
      })}
    </div>
  );
}
