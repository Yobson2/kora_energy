import type { Metadata } from "next";
import { Info } from "lucide-react";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section, SectionHeading } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Financing options",
  description:
    "Four ways businesses pay for solar — outright purchase, staged payments, instalments and energy plans — and who each one suits.",
  path: "/financing",
});

type Option = {
  name: string;
  how: string;
  suits: string;
  own: string;
  upfront: string;
  pros: string[];
  cons: string[];
};

const OPTIONS: Option[] = [
  {
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
    name: "Staged payments",
    how: "The price is split across project milestones — for example at signing, on delivery of equipment, and at commissioning.",
    suits: "Medium and larger projects where cash flow matters during the build.",
    own: "You, on final payment",
    upfront: "A deposit",
    pros: ["Spreads the cost over the project", "Same savings as a purchase"],
    cons: ["Total is still paid within weeks or months"],
  },
  {
    name: "Instalments",
    how: "A partner bank or microfinance institution pays for the system and you repay over one to five years. Repayments can be set close to the monthly savings.",
    suits: "SMEs and households that want savings now without the upfront cost.",
    own: "You, at the end of the term",
    upfront: "Little or none",
    pros: ["Savings can cover much of the repayment", "Ownership at the end"],
    cons: ["Interest adds to the total cost", "Subject to the lender's approval"],
  },
  {
    name: "Energy plan",
    how: "A provider installs and owns the system on your roof. You pay a monthly fee, or a fixed price per kilowatt-hour that is lower than the grid's, for a long term.",
    suits: "Larger commercial and industrial sites that want no capital outlay at all.",
    own: "The provider, with an option to buy",
    upfront: "None",
    pros: ["No investment and no maintenance", "Savings from the first bill"],
    cons: ["Lower lifetime savings", "Long contract, usually 10–20 years"],
  },
];

export default function FinancingPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Financing", path: "/financing" }]}
        title="Ways to pay for solar"
        lead="The right way to pay depends on your cash flow, how long you'll stay on the site, and whether you'd rather own the system or simply buy cheaper energy."
      >
        <div className="bg-paper ring-line flex max-w-3xl gap-3 rounded-[var(--radius-sm)] p-4 ring-1">
          <Info className="text-sun-deep mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="type-small">
            <strong>Part of the product concept.</strong> Kora Energy is fictional and does not
            provide or arrange financing. This page explains common ways commercial solar is paid
            for, as a real provider in the region might present them.
          </p>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          {OPTIONS.map((o) => (
            <article
              key={o.name}
              aria-labelledby={`opt-${o.name}`}
              className="ring-line flex flex-col rounded-[var(--radius-md)] ring-1"
            >
              <div className="flex flex-col gap-3 p-6 md:p-8">
                <h2 id={`opt-${o.name}`} className="type-h2">
                  {o.name}
                </h2>
                <p className="text-muted">{o.how}</p>
                <p>
                  <span className="font-semibold">Suits: </span>
                  {o.suits}
                </p>
              </div>
              <dl className="bg-plaster grid grid-cols-2 gap-4 px-6 py-4 md:px-8">
                <div>
                  <dt className="type-small text-muted">Who owns it</dt>
                  <dd className="font-semibold">{o.own}</dd>
                </div>
                <div>
                  <dt className="type-small text-muted">Paid upfront</dt>
                  <dd className="font-semibold">{o.upfront}</dd>
                </div>
              </dl>
              <div className="grid gap-6 p-6 sm:grid-cols-2 md:p-8">
                <div>
                  <h3 className="type-label mb-2">Advantages</h3>
                  <ul className="type-small flex list-disc flex-col gap-1.5 pl-4">
                    {o.pros.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="type-label mb-2">Trade-offs</h3>
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
        <SectionHeading
          id="choose-title"
          title="Comparing options starts with the savings"
          intro="Whichever way you pay, the question is the same: how does the monthly cost compare with what the system saves? The calculator gives you the savings side in two minutes; a specialist can then model each payment option against it."
        />
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/calculator" variant="primary">
            Calculate your savings
          </ButtonLink>
          <ButtonLink href="/quote" variant="outline">
            Request a quote
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
