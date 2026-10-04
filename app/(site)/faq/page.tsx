import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { Disclosure } from "@/app/components/primitives/disclosure";
import { ButtonLink } from "@/app/components/primitives/button";
import { JsonLd } from "@/app/components/seo/json-ld";
import { faqGroups } from "@/app/content/faq";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Questions and answers",
  description:
    "How accurate the estimate is, what happens in the rainy season and during power cuts, what systems cost and how long they last.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Questions", path: "/faq" }]}
        title="Questions and answers"
        lead="The questions business owners ask us most, answered plainly. If yours isn't here, ask a specialist."
      >
        <nav aria-label="Topics">
          <ul className="flex flex-wrap gap-2">
            {faqGroups.map((g) => (
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
          {faqGroups.map((group) => (
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
          <p className="type-h3">Still have a question?</p>
          <ButtonLink href="/contact" variant="secondary">
            Ask a specialist
          </ButtonLink>
        </div>
      </Section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqGroups.flatMap((g) =>
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
