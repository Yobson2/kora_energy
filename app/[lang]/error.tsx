"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/app/components/primitives/button";
import { useLocale } from "@/app/components/i18n/use-locale";

const COPY = {
  en: {
    title: "This page didn't load.",
    lead: "Something failed on our side. Trying again usually works; if it doesn't, the homepage will.",
    reference: "Reference:",
    retry: "Try again",
    home: "Go to the homepage",
  },
  fr: {
    title: "Cette page ne s'est pas chargée.",
    lead: "Un problème est survenu de notre côté. Réessayer suffit généralement ; sinon, la page d'accueil fonctionnera.",
    reference: "Référence :",
    retry: "Réessayer",
    home: "Aller à l'accueil",
  },
};

/**
 * Last-resort boundary for unexpected render errors. Says what happened and
 * offers the two useful next steps; the digest lets support find the log line.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = COPY[useLocale()];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="bg-plaster flex min-h-dvh items-center">
      <div className="mx-auto flex max-w-xl flex-col items-start gap-6 px-4 py-20">
        <h1 className="type-h1">{t.title}</h1>
        <p className="type-lead text-muted">{t.lead}</p>
        {error.digest && (
          <p className="type-small text-muted tabular">
            {t.reference} {error.digest}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={reset}>
            {t.retry}
          </Button>
          <ButtonLink href="/" variant="outline">
            {t.home}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
