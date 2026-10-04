import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Container } from "@/app/components/primitives/container";
import { QuoteForm } from "@/app/components/quote/quote-form";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import type { Locale } from "@/app/lib/i18n";

const COPY: Record<Locale, { title: string; description: string; lead: string }> = {
  en: {
    title: "Request a quote",
    description:
      "Tell us about your site and an energy specialist will prepare a solar proposal for you. Four short steps, about three minutes.",
    lead: "Four short steps, about three minutes. An energy specialist reviews every request and replies within one working day.",
  },
  fr: {
    title: "Demander un devis",
    description:
      "Décrivez votre site et un conseiller en énergie préparera une proposition solaire pour vous. Quatre étapes courtes, environ trois minutes.",
    lead: "Quatre étapes courtes, environ trois minutes. Un conseiller en énergie étudie chaque demande et répond sous un jour ouvré.",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/quote">): Promise<Metadata> {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  return pageMetadata({ title: t.title, description: t.description, path: "/quote", locale });
}

export default async function QuotePage({ params }: PageProps<"/[lang]/quote">) {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[{ name: t.title, path: "/quote" }]}
        title={t.title}
        lead={t.lead}
      />
      <Container className="py-12 md:py-16">
        <Suspense fallback={<div className="bg-plaster h-[36rem] rounded-[var(--radius-md)]" />}>
          <QuoteForm />
        </Suspense>
      </Container>
    </>
  );
}
