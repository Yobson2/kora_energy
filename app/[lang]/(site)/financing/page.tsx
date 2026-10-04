import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section, SectionHeading } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import type { Locale } from "@/app/lib/i18n";

type Option = {
  /** Stable across languages: it is the heading's id. */
  id: string;
  name: string;
  how: string;
  suits: string;
  own: string;
  upfront: string;
  pros: string[];
  cons: string[];
};

const en = {
  metaTitle: "Financing options",
  description:
    "Four ways businesses pay for solar: outright purchase, staged payments, instalments and energy plans, and who each one suits.",
  crumb: "Financing",
  title: "Ways to pay for solar",
  lead: "The right way to pay depends on your cash flow, how long you'll stay on the site, and whether you'd rather own the system or simply buy cheaper energy.",
  noticeStrong: "Part of the product concept.",
  notice:
    "Kora Energy is fictional and does not provide or arrange financing. This page explains common ways commercial solar is paid for, as a real provider in the region might present them.",
  suits: "Suits: ",
  owner: "Who owns it",
  upfront: "Paid upfront",
  pros: "Advantages",
  cons: "Trade-offs",
  chooseTitle: "Comparing options starts with the savings",
  chooseIntro:
    "Whichever way you pay, the question is the same: how does the monthly cost compare with what the system saves? The calculator gives you the savings side in two minutes; a specialist can then model each payment option against it.",
  calculate: "Calculate your savings",
  quote: "Request a quote",
  options: [
    {
      id: "purchase",
      name: "Purchase",
      how: "You pay for the system and own it from the day it is commissioned. Every kilowatt-hour it produces afterwards is free.",
      suits: "Businesses with cash or a credit line, and a site they expect to occupy for years.",
      own: "You, from day one",
      upfront: "The full price",
      pros: [
        "Highest lifetime savings",
        "Simplest contract",
        "The system adds to the value of the property",
      ],
      cons: ["Ties up capital", "You carry the maintenance after the warranty period"],
    },
    {
      id: "staged",
      name: "Staged payments",
      how: "The price is split across project milestones, for example at signing, on delivery of equipment, and at commissioning.",
      suits: "Medium and larger projects where cash flow matters during the build.",
      own: "You, on final payment",
      upfront: "A deposit",
      pros: ["Spreads the cost over the project", "Same savings as a purchase"],
      cons: ["Total is still paid within weeks or months"],
    },
    {
      id: "instalments",
      name: "Instalments",
      how: "A partner bank or microfinance institution pays for the system and you repay over one to five years. Repayments can be set close to the monthly savings.",
      suits: "SMEs and households that want savings now without the upfront cost.",
      own: "You, at the end of the term",
      upfront: "Little or none",
      pros: ["Savings can cover much of the repayment", "Ownership at the end"],
      cons: ["Interest adds to the total cost", "Subject to the lender's approval"],
    },
    {
      id: "energy-plan",
      name: "Energy plan",
      how: "A provider installs and owns the system on your roof. You pay a monthly fee, or a fixed price per kilowatt-hour that is lower than the grid's, for a long term.",
      suits: "Larger commercial and industrial sites that want no capital outlay at all.",
      own: "The provider, with an option to buy",
      upfront: "None",
      pros: ["No investment and no maintenance", "Savings from the first bill"],
      cons: ["Lower lifetime savings", "Long contract, usually 10–20 years"],
    },
  ] as Option[],
};

const fr: typeof en = {
  metaTitle: "Options de financement",
  description:
    "Quatre façons de payer le solaire pour une entreprise : achat comptant, paiements échelonnés, crédit et contrat d'énergie, et à qui chacune convient.",
  crumb: "Financement",
  title: "Comment payer le solaire",
  lead: "La bonne façon de payer dépend de votre trésorerie, du temps que vous resterez sur le site, et de votre préférence entre posséder le système ou simplement acheter une énergie moins chère.",
  noticeStrong: "Élément du concept produit.",
  notice:
    "Kora Energy est fictive et ne fournit ni n'organise aucun financement. Cette page présente les façons courantes de financer le solaire professionnel, comme un vrai fournisseur de la région pourrait le faire.",
  suits: "Pour qui : ",
  owner: "Propriétaire",
  upfront: "Payé au départ",
  pros: "Avantages",
  cons: "Contreparties",
  chooseTitle: "Comparer les options commence par les économies",
  chooseIntro:
    "Quelle que soit la façon de payer, la question est la même : comment le coût mensuel se compare-t-il à ce que le système fait économiser ? Le simulateur vous donne les économies en deux minutes ; un conseiller peut ensuite comparer chaque option de paiement.",
  calculate: "Calculer vos économies",
  quote: "Demander un devis",
  options: [
    {
      id: "purchase",
      name: "Achat comptant",
      how: "Vous payez le système et en êtes propriétaire dès sa mise en service. Chaque kilowattheure produit ensuite est gratuit.",
      suits:
        "Les entreprises disposant de trésorerie ou d'une ligne de crédit, et d'un site qu'elles comptent occuper des années.",
      own: "Vous, dès le premier jour",
      upfront: "Le prix total",
      pros: [
        "Les économies les plus élevées sur la durée",
        "Le contrat le plus simple",
        "Le système valorise le bien immobilier",
      ],
      cons: ["Immobilise du capital", "L'entretien est à votre charge après la garantie"],
    },
    {
      id: "staged",
      name: "Paiements échelonnés",
      how: "Le prix est réparti sur les étapes du projet, par exemple à la signature, à la livraison du matériel et à la mise en service.",
      suits: "Les projets moyens et grands, où la trésorerie compte pendant les travaux.",
      own: "Vous, au dernier paiement",
      upfront: "Un acompte",
      pros: ["Étale le coût sur la durée du projet", "Les mêmes économies qu'un achat"],
      cons: ["Le total reste payé en quelques semaines ou mois"],
    },
    {
      id: "instalments",
      name: "Crédit",
      how: "Une banque ou une institution de microfinance partenaire paie le système et vous remboursez sur un à cinq ans. Les mensualités peuvent être proches des économies mensuelles.",
      suits:
        "Les PME et les ménages qui veulent des économies tout de suite, sans dépense initiale.",
      own: "Vous, à la fin du crédit",
      upfront: "Peu ou rien",
      pros: [
        "Les économies peuvent couvrir une grande partie des mensualités",
        "Propriété à la fin",
      ],
      cons: ["Les intérêts alourdissent le coût total", "Soumis à l'accord du prêteur"],
    },
    {
      id: "energy-plan",
      name: "Contrat d'énergie",
      how: "Un fournisseur installe le système sur votre toit et en reste propriétaire. Vous payez un forfait mensuel, ou un prix fixe par kilowattheure inférieur à celui du réseau, sur une longue durée.",
      suits:
        "Les grands sites commerciaux et industriels qui ne veulent aucune dépense d'investissement.",
      own: "Le fournisseur, avec option d'achat",
      upfront: "Rien",
      pros: ["Ni investissement ni entretien", "Des économies dès la première facture"],
      cons: ["Des économies plus faibles sur la durée", "Contrat long, en général 10 à 20 ans"],
    },
  ],
};

const COPY: Record<Locale, typeof en> = { en, fr };

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/financing">): Promise<Metadata> {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  return pageMetadata({
    title: t.metaTitle,
    description: t.description,
    path: "/financing",
    locale,
  });
}

export default async function FinancingPage({ params }: PageProps<"/[lang]/financing">) {
  const locale = await pageLocale(params);
  const t = COPY[locale];

  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[{ name: t.crumb, path: "/financing" }]}
        title={t.title}
        lead={t.lead}
      >
        <div className="bg-paper ring-line flex max-w-3xl gap-3 rounded-[var(--radius-sm)] p-4 ring-1">
          <Info className="text-sun-deep mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="type-small">
            <strong>{t.noticeStrong}</strong> {t.notice}
          </p>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          {t.options.map((o) => (
            <article
              key={o.id}
              aria-labelledby={`opt-${o.id}`}
              className="ring-line flex flex-col rounded-[var(--radius-md)] ring-1"
            >
              <div className="flex flex-col gap-3 p-6 md:p-8">
                <h2 id={`opt-${o.id}`} className="type-h2">
                  {o.name}
                </h2>
                <p className="text-muted">{o.how}</p>
                <p>
                  <span className="font-semibold">{t.suits}</span>
                  {o.suits}
                </p>
              </div>
              <dl className="bg-plaster grid grid-cols-2 gap-4 px-6 py-4 md:px-8">
                <div>
                  <dt className="type-small text-muted">{t.owner}</dt>
                  <dd className="font-semibold">{o.own}</dd>
                </div>
                <div>
                  <dt className="type-small text-muted">{t.upfront}</dt>
                  <dd className="font-semibold">{o.upfront}</dd>
                </div>
              </dl>
              <div className="grid gap-6 p-6 sm:grid-cols-2 md:p-8">
                <div>
                  <h3 className="type-label mb-2">{t.pros}</h3>
                  <ul className="type-small flex list-disc flex-col gap-1.5 pl-4">
                    {o.pros.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="type-label mb-2">{t.cons}</h3>
                  <ul className="type-small text-muted flex list-disc flex-col gap-1.5 pl-4">
                    {o.cons.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="plaster" labelledBy="choose-title">
        <SectionHeading id="choose-title" title={t.chooseTitle} intro={t.chooseIntro} />
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/calculator" variant="primary">
            {t.calculate}
          </ButtonLink>
          <ButtonLink href="/quote" variant="outline">
            {t.quote}
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
