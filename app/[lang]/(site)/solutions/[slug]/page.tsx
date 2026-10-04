import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { Link } from "@/app/components/primitives/link";
import { Container } from "@/app/components/primitives/container";
import { DayCurve } from "@/app/components/visuals/day-curve";
import { getSolution, getSolutions, solutions } from "@/app/content/solutions";
import { labels } from "@/app/content/labels";
import { photos } from "@/app/content/media";
import { PhotoFigure } from "@/app/components/media/photo";
import { estimate } from "@/app/lib/solar/estimate";
import { toEstimateQuery } from "@/app/lib/estimate-query";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import type { Locale } from "@/app/lib/i18n";

type Props = PageProps<"/[lang]/solutions/[slug]">;

export const dynamicParams = false;

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await pageLocale(params);
  const solution = getSolution((await params).slug, locale);
  if (!solution) return {};
  return pageMetadata({
    title: solution.name,
    description: `${solution.summary} ${solution.outcome}`,
    path: `/solutions/${solution.slug}`,
    locale,
  });
}

const EXAMPLE_BILL: Record<string, number> = {
  household: 150_000,
  industrial: 12_000_000,
};

type Copy = {
  crumb: string;
  quote: string;
  estimate: string;
  caption: string;
  problem: string;
  how: string;
  included: string;
  example: string;
  exampleTitle: (site: string) => string;
  exampleNoteBefore: (site: string, design: string) => string;
  tryIt: string;
  benefits: string;
  forWho: string;
  outcome: string;
  typical: string;
  typicalNote: string;
  next: string;
  others: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    crumb: "Solutions",
    quote: "Request a quote",
    estimate: "Estimate your savings",
    caption: "Illustrative photograph, not a Kora installation.",
    problem: "The problem",
    how: "How we solve it",
    included: "What's included",
    example: "An example day",
    exampleTitle: (site) => `Average day for a typical ${site}`,
    exampleNoteBefore: (site, design) =>
      `Illustrative: a typical ${site} in Abidjan, designed for “${design}”. Your own day will look different: `,
    tryIt: "try it with your figures",
    benefits: "What it changes for you",
    forWho: "Who it's for",
    outcome: "Expected outcome",
    typical: "Typical size: ",
    typicalNote: ". Indicative ranges from the estimation model; a survey sets the real figures.",
    next: "Ready to see the numbers for your site?",
    others: "Other solutions",
  },
  fr: {
    crumb: "Solutions",
    quote: "Demander un devis",
    estimate: "Estimer vos économies",
    caption: "Photographie d'illustration, pas une installation Kora.",
    problem: "Le problème",
    how: "Notre réponse",
    included: "Ce qui est compris",
    example: "Une journée type",
    exampleTitle: (site) => `Journée moyenne pour ${site}`,
    exampleNoteBefore: (site, design) =>
      `À titre indicatif : ${site} à Abidjan, avec un système conçu pour « ${design} ». Votre propre journée sera différente : `,
    tryIt: "essayez avec vos chiffres",
    benefits: "Ce que cela change pour vous",
    forWho: "Pour qui",
    outcome: "Résultat attendu",
    typical: "Taille typique : ",
    typicalNote:
      ". Fourchettes indicatives issues du modèle d'estimation ; une visite technique fixe les chiffres réels.",
    next: "Prêt à voir les chiffres pour votre site ?",
    others: "Autres solutions",
  },
};

export default async function SolutionPage({ params }: Props) {
  const locale = await pageLocale(params);
  const solution = getSolution((await params).slug, locale);
  if (!solution) notFound();

  const t = COPY[locale];
  const l = labels(locale);
  const { segment, independence } = solution.calculator;
  const example = estimate({
    segment,
    location: "abidjan",
    independence,
    monthlyBillXof: EXAMPLE_BILL[segment] ?? 2_000_000,
  });
  const others = getSolutions(locale)
    .filter((s) => s.slug !== solution.slug)
    .slice(0, 3);
  const site = locale === "fr" ? l.segmentWithArticle[segment] : l.segment[segment].toLowerCase();
  const design = l.independence[independence].label;

  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[
          { name: t.crumb, path: "/solutions" },
          { name: solution.name, path: `/solutions/${solution.slug}` },
        ]}
        title={solution.name}
        lead={solution.summary}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink
            href={`/quote${toEstimateQuery({ solution: solution.slug, segment })}`}
            variant="primary"
          >
            {t.quote}
          </ButtonLink>
          <ButtonLink
            href={`/calculator${toEstimateQuery({ segment, independence })}`}
            variant="outline"
          >
            {t.estimate}
          </ButtonLink>
        </div>
      </PageHeader>

      <Section>
        <PhotoFigure
          photo={photos[solution.photo]}
          locale={locale}
          ratio="2/1"
          sizes="(min-width: 1360px) 1264px, 100vw"
          priority
          caption={t.caption}
          className="mb-14 md:mb-20"
        />
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h2 className="type-h2">{t.problem}</h2>
              <p className="type-lead text-muted">{solution.problem}</p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="type-h2">{t.how}</h2>
              <p className="type-lead text-muted">{solution.approach}</p>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="type-h3">{t.included}</h2>
              <ul className="flex flex-col gap-2.5">
                {solution.includes.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="text-sun-deep mt-0.5 size-5 shrink-0" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside
            aria-labelledby="example-title"
            className="bg-plaster flex h-fit flex-col gap-5 rounded-[var(--radius-md)] p-6 md:p-8"
          >
            <h2 id="example-title" className="type-h3">
              {t.example}
            </h2>
            <DayCurve day={example.day} locale={locale} title={t.exampleTitle(site)} />
            <p className="type-small text-muted">
              {t.exampleNoteBefore(site, locale === "fr" ? design : design.toLowerCase())}
              <Link
                href={`/calculator${toEstimateQuery({ segment, independence })}`}
                className="text-ink underline underline-offset-2"
              >
                {t.tryIt}
              </Link>
              .
            </p>
          </aside>
        </div>
      </Section>

      <Section tone="plaster" labelledBy="benefits-title">
        <h2 id="benefits-title" className="type-h2 max-w-2xl">
          {t.benefits}
        </h2>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {solution.benefits.map((b) => (
            <li key={b.title} className="border-ink flex flex-col gap-2 border-t-2 pt-5">
              <h3 className="type-h3">{b.title}</h3>
              <p className="text-muted">{b.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="fit-title">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 id="fit-title" className="type-h2">
              {t.forWho}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {solution.audience.map((a) => (
                <li key={a} className="ring-line rounded-[var(--radius-pill)] px-3.5 py-1.5 ring-1">
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="type-h2">{t.outcome}</h2>
            <p className="type-lead">{solution.outcome}</p>
            <p className="type-small text-muted">
              {t.typical}
              <span className="tabular text-ink font-semibold">{solution.typical}</span>
              {t.typicalNote}
            </p>
          </div>
        </div>
      </Section>

      <section aria-labelledby="next-title" className="bg-ink text-paper">
        <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col items-start gap-5">
            <h2 id="next-title" className="type-h2">
              {t.next}
            </h2>
            <ButtonLink
              href={`/quote${toEstimateQuery({ solution: solution.slug, segment })}`}
              variant="primary"
              size="lg"
            >
              {t.quote}
            </ButtonLink>
          </div>
          <nav aria-label={t.others}>
            <h3 className="type-label text-on-ink-muted mb-3">{t.others}</h3>
            <ul className="border-ink-line border-t">
              {others.map((o) => (
                <li key={o.slug} className="border-ink-line border-b">
                  <Link
                    href={`/solutions/${o.slug}`}
                    className="hover:text-sun flex flex-col gap-1 py-4 sm:flex-row sm:justify-between"
                  >
                    <span className="font-semibold">{o.name}</span>
                    <span className="text-on-ink-muted type-small">{o.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>
    </>
  );
}
