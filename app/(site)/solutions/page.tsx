import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section, SectionHeading } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { solutions } from "@/app/content/solutions";
import { photos } from "@/app/content/media";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Solutions",
  description:
    "Solar for businesses, commercial buildings, industry and homes, plus battery backup and energy monitoring — each designed around how the site uses energy.",
  path: "/solutions",
});

/** Who each solution suits, as a matrix — the question visitors actually arrive with. */
const MATRIX: Array<{ need: string; fits: string[] }> = [
  { need: "Lower my electricity bill", fits: ["business", "commercial", "industrial"] },
  { need: "Stay powered during outages", fits: ["backup", "residential", "commercial"] },
  { need: "Run less on the generator", fits: ["backup", "commercial", "business"] },
  { need: "Understand where my energy goes", fits: ["monitoring"] },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Solutions", path: "/solutions" }]}
        title="Six ways to put the sun to work"
        lead="Every system starts from the same question: when does your site use energy, and what happens when the grid stops? The answer decides which of these fits."
      />

      <Section>
        <ul className="bg-line grid gap-px overflow-hidden rounded-[var(--radius-md)] md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((s) => (
            <li key={s.slug} className="bg-paper group relative flex flex-col gap-4 p-6 md:p-8">
              {/* Decorative here: the card's name is the link text, and the
                  photo's description and credit live on the solution page. */}
              <div className="bg-plaster-deep relative -mx-6 -mt-6 aspect-[3/2] overflow-hidden md:-mx-8 md:-mt-8">
                <Image
                  src={photos[s.photo].image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  placeholder="blur"
                  className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-[1.03]"
                />
              </div>
              <h2 className="type-h3">
                <Link href={`/solutions/${s.slug}`} className="after:absolute after:inset-0">
                  {s.name}
                </Link>
              </h2>
              <p className="text-muted">{s.summary}</p>
              <ul className="type-small flex flex-col gap-1">
                {s.audience.slice(0, 3).map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              <p className="type-small border-line mt-auto border-t pt-4">
                <span className="text-muted">Typical size </span>
                <span className="tabular font-semibold">{s.typical}</span>
              </p>
              <span
                aria-hidden
                className="bg-sun absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100"
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="plaster" labelledBy="matrix-title">
        <SectionHeading
          id="matrix-title"
          title="Start from what you need"
          intro="Most sites combine two: solar for the savings, storage for the outages."
        />
        <div className="mt-10 overflow-x-auto">
          <table className="bg-paper w-full min-w-[36rem] rounded-[var(--radius-md)] text-left">
            <caption className="sr-only">Which solutions fit which need</caption>
            <thead>
              <tr className="border-line border-b">
                <th scope="col" className="type-label px-5 py-4">
                  If you want to…
                </th>
                <th scope="col" className="type-label px-5 py-4">
                  Look at
                </th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row) => (
                <tr key={row.need} className="border-line border-b last:border-0">
                  <th scope="row" className="px-5 py-4 font-semibold">
                    {row.need}
                  </th>
                  <td className="px-5 py-4">
                    <ul className="flex flex-wrap gap-2">
                      {row.fits.map((slug) => {
                        const s = solutions.find((x) => x.slug === slug)!;
                        return (
                          <li key={slug}>
                            <Link
                              href={`/solutions/${slug}`}
                              className="type-small ring-line hover:ring-ink inline-block rounded-[var(--radius-pill)] px-3 py-1 ring-1"
                            >
                              {s.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/calculator" variant="primary">
            Calculate your savings
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Ask a specialist
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
