import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { Disclosure } from "@/app/components/primitives/disclosure";
import { ButtonLink } from "@/app/components/primitives/button";
import { JsonLd } from "@/app/components/seo/json-ld";
import { faqContent } from "@/app/content/faq";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import type { Locale } from "@/app/lib/i18n";

const COPY: Record<
  Locale,
  {
    title: string;
    description: string;
    crumb: string;
    lead: string;
    topics: string;
    more: string;
    ask: string;
  }
> = {
  en: {
    title: "Questions and answers",
    description:
      "How accurate the estimate is, what happens in the rainy season and during power cuts, what systems cost and how long they last.",
    crumb: "Questions",
    lead: "The questions business owners ask us most, answered plainly. If yours isn't here, ask a specialist.",
    topics: "Topics",
    more: "Still have a question?",
    ask: "Ask a specialist",
  },
  fr: {
    title: "Questions et réponses",
    description:
      "La précision de l'estimation, la saison des pluies et les coupures de courant, le coût des systèmes et leur durée de vie.",
    crumb: "Questions",
    lead: "Les questions que les chefs d'entreprise nous posent le plus, avec des réponses claires. Si la vôtre n'y est pas, demandez à un conseiller.",
    topics: "Thèmes",
    more: "Une autre question ?",
    ask: "Demander à un conseiller",
  },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  return pageMetadata({ title: t.title, description: t.description, path: "/faq", locale });
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  const { groups } = faqContent(locale);

  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[{ name: t.crumb, path: "/faq" }]}
        title={t.title}
        lead={t.lead}
      >
        <nav aria-label={t.topics}>
          <ul className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="bg-paper ring-line hover:ring-ink inline-block rounded-[var(--radius-pill)] px-3.5 py-1.5 ring-1"
                >
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <Section>
        <div className="flex flex-col gap-16">
          {groups.map((group) => (
            <section
              key={group.id}
              id={group.id}
              aria-labelledby={`${group.id}-title`}
              className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:gap-16"
            >
              <h2 id={`${group.id}-title`} className="type-h2">
                {group.title}
              </h2>
              <div className="border-line border-b">
                {group.items.map((item) => (
                  <Disclosure key={item.question} summary={item.question}>
                    {item.answer}
                  </Disclosure>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="bg-plaster mt-16 flex flex-col gap-4 rounded-[var(--radius-md)] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <p className="type-h3">{t.more}</p>
          <ButtonLink href="/contact" variant="secondary">
            {t.ask}
          </ButtonLink>
        </div>
      </Section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: locale,
          mainEntity: groups.flatMap((g) =>
            g.items.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: { "@type": "Answer", text: item.answer },
            }))
          ),
        }}
      />
    </>
  );
}
