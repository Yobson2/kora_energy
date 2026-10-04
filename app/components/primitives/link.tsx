"use client";

import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { useLocale } from "@/app/components/i18n/use-locale";
import { localizePath } from "@/app/lib/i18n";

/**
 * next/link that keeps the visitor in their language: "/calculator" becomes
 * "/fr/calculator" on a French page. Components write language-free paths and
 * never think about prefixes. External, API and back-office links pass through.
 */
export function Link({
  href,
  ...rest
}: Omit<ComponentPropsWithoutRef<typeof NextLink>, "href"> & { href: string }) {
  const locale = useLocale();
  return <NextLink href={localizePath(href, locale)} {...rest} />;
}
