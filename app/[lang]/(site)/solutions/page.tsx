import Image from "next/image";
import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section, SectionHeading } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { Link } from "@/app/components/primitives/link";
import { getSolutions } from "@/app/content/solutions";
import { photos } from "@/app/content/media";
import type { SolutionSlug } from "@/app/lib/domain";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import type { Locale } from "@/app/lib/i18n";

/** Who each solution suits, as a matrix: the question visitors actually arrive with. */
const MATRIX: SolutionSlug[][] = [
  ["business", "commercial", "industrial"],
  ["backup", "residential", "commercial"],
  ["backup", "commercial", "business"],
  ["monitoring"],
];

const COPY: Record<
  Locale,
  {
    description: string;
    title: string;
    lead: string;
    typical: string;
    matrixTitle: string;
    matrixIntro: string;
    caption: string;
    want: string;
    look: string;
    needs: string[];
    calculate: string;
    ask: string;
  }
> = {
  en: {
    description:
      "Solar for businesses, commercial buildings, industry and homes, plus battery backup and energy monitoring, each designed around how the site uses energy.",
    title: "Six ways to put the sun to work",
    lead: "Every system starts from the same question: when does your site use energy, and what happens when the grid stops? The answer decides which of these fits.",
    typical: "Typical size ",
    matrixTitle: "Start from what you need",
    matrixIntro: "Most sites combine two: solar for the savings, storage for the outages.",
    caption: "Which solutions fit which need",
    want: "If you want to…",
    look: "Look at",
    needs: [
      "Lower my electricity bill",
      "Stay powered during outages",
      "Run less on the generator",
      "Understand where my energy goes",
    ],
    calculate: "Calculate your savings",
    ask: "Ask a specialist",
  },
  fr: {
    description:
      "Le solaire pour les entreprises, le tertiaire, l'industrie et les logements, ainsi que les batteries de secours et le suivi énergétique, chacun conçu selon la façon dont le site consomme.",
    title: "Six façons de faire travailler le soleil",
    lead: "Chaque système part de la même question : quand votre site consomme-t-il de l'énergie, et que se passe-t-il quand le réseau s'arrête ? La réponse décide de la solution qui convient.",
    typical: "Taille typique ",
    matrixTitle: "Partez de votre besoin",
    matrixIntro:
      "La plupart des sites en combinent deux : le solaire pour les économies, le stockage pour les coupures.",
    caption: "Quelles solutions répondent à quel besoin",
    want: "Si vous voulez…",
    look: "Regardez",
    needs: [
      "Réduire ma facture d'électricité",
      "Garder le courant pendant les coupures",
      "Moins utiliser le groupe électrogène",
      "Comprendre où part mon énergie",
    ],
    calculate: "Calculer vos économies",
    ask: "Demander à un conseiller",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/solutions">): Promise<Metadata> {
  const locale = await pageLocale(params);
  return pageMetadata({
    title: "Solutions",
    description: COPY[locale].description,
    path: "/solutions",
    locale,
  });
}

export default async function SolutionsPage({ params }: PageProps<"/[lang]/solutions">) {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  const solutions = getSolutions(locale);

  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[{ name: "Solutions", path: "/solutions" }]}
        title={t.title}
        lead={t.lead}
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
                <span className="text-muted">{t.typical}</span>
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
        <SectionHeading id="matrix-title" title={t.matrixTitle} intro={t.matrixIntro} />
        <div className="mt-10 overflow-x-auto">
          <table className="bg-paper w-full min-w-[36rem] rounded-[var(--radius-md)] text-left">
            <caption className="sr-only">{t.caption}</caption>
            <thead>
              <tr className="border-line border-b">
                <th scope="col" className="type-label px-5 py-4">
                  {t.want}
                </th>
                <th scope="col" className="type-label px-5 py-4">
                  {t.look}
                </th>
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((fits, i) => (
                <tr key={t.needs[i]} className="border-line border-b last:border-0">
                  <th scope="row" className="px-5 py-4 font-semibold">
                    {t.needs[i]}
                  </th>
                  <td className="px-5 py-4">
                    <ul className="flex flex-wrap gap-2">
                      {fits.map((slug) => {
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
            {t.calculate}
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            {t.ask}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
