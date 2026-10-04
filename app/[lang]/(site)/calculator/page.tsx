import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Container } from "@/app/components/primitives/container";
import { Calculator } from "@/app/components/calculator/calculator";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import type { Locale } from "@/app/lib/i18n";

const COPY: Record<
  Locale,
  { metaTitle: string; description: string; crumb: string; title: string; lead: string }
> = {
  en: {
    metaTitle: "Solar savings calculator",
    description:
      "Estimate the solar system your business needs, what it costs and how much it could save, in FCFA, for your city in Côte d'Ivoire.",
    crumb: "Calculator",
    title: "Estimate your solar savings",
    lead: "Tell us about your site and see a suggested system, its cost and its payback, updated as you type. Every figure is an estimate, and the assumptions are listed beneath the result.",
  },
  fr: {
    metaTitle: "Simulateur d'économies solaires",
    description:
      "Estimez le système solaire dont votre entreprise a besoin, son coût et ce qu'il pourrait vous faire économiser, en FCFA, pour votre ville en Côte d'Ivoire.",
    crumb: "Simulateur",
    title: "Estimez vos économies solaires",
    lead: "Décrivez votre site et découvrez un système proposé, son coût et son retour sur investissement, mis à jour pendant la saisie. Chaque chiffre est une estimation, et les hypothèses sont détaillées sous le résultat.",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/calculator">): Promise<Metadata> {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  return pageMetadata({
    title: t.metaTitle,
    description: t.description,
    path: "/calculator",
    locale,
  });
}

export default async function CalculatorPage({ params }: PageProps<"/[lang]/calculator">) {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[{ name: t.crumb, path: "/calculator" }]}
        title={t.title}
        lead={t.lead}
      />
      <Container className="py-12 md:py-16">
        {/* useSearchParams needs a Suspense boundary so the page shell can
            still be statically rendered. */}
        <Suspense fallback={<div className="bg-plaster h-[40rem] rounded-[var(--radius-md)]" />}>
          <Calculator />
        </Suspense>
      </Container>
    </>
  );
}
