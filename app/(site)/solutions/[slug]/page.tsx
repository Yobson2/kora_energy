import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { Container } from "@/app/components/primitives/container";
import { DayCurve } from "@/app/components/visuals/day-curve";
import { getSolution, solutions } from "@/app/content/solutions";
import { photos } from "@/app/content/media";
import { PhotoFigure } from "@/app/components/media/photo";
import { estimate } from "@/app/lib/solar/estimate";
import { INDEPENDENCE_RULES, SEGMENT_LABEL } from "@/app/lib/solar/assumptions";
import { toEstimateQuery } from "@/app/lib/estimate-query";
import { pageMetadata } from "@/app/lib/metadata";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const solution = getSolution((await params).slug);
  if (!solution) return {};
  return pageMetadata({
    title: solution.name,
    description: `${solution.summary} ${solution.outcome}`,
    path: `/solutions/${solution.slug}`,
  });
}

const EXAMPLE_BILL: Record<string, number> = {
  household: 150_000,
  industrial: 12_000_000,
};

export default async function SolutionPage({ params }: Props) {
  const solution = getSolution((await params).slug);
  if (!solution) notFound();

  const { segment, independence } = solution.calculator;
  const example = estimate({
    segment,
    location: "abidjan",
    independence,
    monthlyBillXof: EXAMPLE_BILL[segment] ?? 2_000_000,
  });
  const others = solutions.filter((s) => s.slug !== solution.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Solutions", path: "/solutions" },
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
            Request a quote
          </ButtonLink>
          <ButtonLink
            href={`/calculator${toEstimateQuery({ segment, independence })}`}
            variant="outline"
          >
            Estimate your savings
          </ButtonLink>
        </div>
      </PageHeader>

      <Section>
        <PhotoFigure
          photo={photos[solution.photo]}
          ratio="2/1"
          sizes="(min-width: 1360px) 1264px, 100vw"
          priority
          caption="Illustrative photograph, not a Kora installation."
          className="mb-14 md:mb-20"
        />
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
              <h2 className="type-h2">The problem</h2>
              <p className="type-lead text-muted">{solution.problem}</p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="type-h2">How we solve it</h2>
              <p className="type-lead text-muted">{solution.approach}</p>
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="type-h3">What&apos;s included</h2>
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
              An example day
            </h2>
            <DayCurve
              day={example.day}
              title={`Average day for a typical ${SEGMENT_LABEL[segment].toLowerCase()}`}
            />
            <p className="type-small text-muted">
              Illustrative: a typical {SEGMENT_LABEL[segment].toLowerCase()} in Abidjan, designed
              for “{INDEPENDENCE_RULES[independence].label.toLowerCase()}”. Your own day will look
              different —{" "}
              <Link
                href={`/calculator${toEstimateQuery({ segment, independence })}`}
                className="text-ink underline underline-offset-2"
              >
                try it with your figures
              </Link>
              .
            </p>
          </aside>
        </div>
      </Section>

      <Section tone="plaster" labelledBy="benefits-title">
        <h2 id="benefits-title" className="type-h2 max-w-2xl">
          What it changes for you
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
              Who it&apos;s for
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
            <h2 className="type-h2">Expected outcome</h2>
            <p className="type-lead">{solution.outcome}</p>
            <p className="type-small text-muted">
              Typical size:{" "}
              <span className="tabular text-ink font-semibold">{solution.typical}</span>. Indicative
              ranges from the estimation model; a survey sets the real figures.
            </p>
          </div>
        </div>
      </Section>

      <section aria-labelledby="next-title" className="bg-ink text-paper">
        <Container className="grid gap-10 py-16 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col items-start gap-5">
            <h2 id="next-title" className="type-h2">
              Ready to see the numbers for your site?
            </h2>
            <ButtonLink
              href={`/quote${toEstimateQuery({ solution: solution.slug, segment })}`}
              variant="primary"
              size="lg"
            >
              Request a quote
            </ButtonLink>
          </div>
          <nav aria-label="Other solutions">
            <h3 className="type-label text-on-ink-muted mb-3">Other solutions</h3>
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
