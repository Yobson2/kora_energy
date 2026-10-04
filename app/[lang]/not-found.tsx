"use client";

import { LogoMark } from "@/app/components/nav/logo";
import { ButtonLink } from "@/app/components/primitives/button";
import { Link } from "@/app/components/primitives/link";
import { useLocale } from "@/app/components/i18n/use-locale";

const COPY = {
  en: {
    home: "Kora Energy home",
    title: "This page isn't here.",
    lead: "The address may be mistyped, or the page may have moved. Projects that are no longer published also end up here.",
    toHome: "Go to the homepage",
    calculator: "Open the calculator",
  },
  fr: {
    home: "Kora Energy, accueil",
    title: "Cette page n'existe pas.",
    lead: "L'adresse est peut-être mal saisie, ou la page a été déplacée. Les projets qui ne sont plus publiés arrivent aussi ici.",
    toHome: "Aller à l'accueil",
    calculator: "Ouvrir le simulateur",
  },
};

/**
 * Rendered for unknown addresses (via [...missing]) and for notFound() in
 * pages. A client component because not-found receives no params; the
 * language comes from the [lang] segment of the URL.
 */
export default function NotFound() {
  const t = COPY[useLocale()];
  return (
    <main id="main" className="bg-plaster flex min-h-dvh items-center">
      <div className="mx-auto flex max-w-xl flex-col items-start gap-6 px-4 py-20">
        <Link href="/" aria-label={t.home}>
          <LogoMark className="size-10" />
        </Link>
        <h1 className="type-h1">{t.title}</h1>
        <p className="type-lead text-muted">{t.lead}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/" variant="secondary">
            {t.toHome}
          </ButtonLink>
          <ButtonLink href="/calculator" variant="outline">
            {t.calculator}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
