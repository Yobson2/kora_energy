import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone } from "lucide-react";
import { StatusChip } from "@/app/components/admin/status-chip";
import { LeadActions } from "@/app/components/admin/lead-actions";
import { requireAdminPage } from "@/app/server/auth/current";
import { getLead } from "@/app/server/leads";
import { solutions } from "@/app/content/solutions";
import { CONTACT_TOPIC_LABEL, LEAD_SOURCE_LABEL, TIMELINE_LABEL } from "@/app/lib/domain";
import { INDEPENDENCE_RULES, LOCATION, SEGMENT_LABEL } from "@/app/lib/solar/assumptions";
import {
  formatDateTime,
  formatKwp,
  formatNumber,
  formatPercent,
  formatXof,
  formatYears,
} from "@/app/lib/format";
import { toEstimateQuery } from "@/app/lib/estimate-query";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requireAdminPage();
  const lead = await getLead((await params).id);
  return { title: lead ? (lead.contact.company ?? lead.contact.name) : "Lead not found" };
}

export default async function LeadPage({ params }: Props) {
  await requireAdminPage();
  const lead = await getLead((await params).id);
  if (!lead) notFound();

  const site: Array<[string, string | undefined]> = [
    ["Type of site", lead.site.segment && SEGMENT_LABEL[lead.site.segment]],
    ["Location", lead.site.location && LOCATION[lead.site.location].label],
    ["Solution", solutions.find((s) => s.slug === lead.site.solution)?.name],
    ["Timeline", lead.site.timeline && TIMELINE_LABEL[lead.site.timeline]],
    [
      "Monthly bill",
      lead.site.monthlyBillXof !== undefined ? formatXof(lead.site.monthlyBillXof) : undefined,
    ],
    [
      "Monthly consumption",
      lead.site.monthlyKwh !== undefined ? `${formatNumber(lead.site.monthlyKwh)} kWh` : undefined,
    ],
    [
      "Generator",
      lead.site.generatorHoursPerWeek ? `${lead.site.generatorHoursPerWeek} h / week` : undefined,
    ],
    [
      "Roof space",
      lead.site.roofAreaM2 !== undefined ? `${formatNumber(lead.site.roofAreaM2)} m²` : undefined,
    ],
    ["Topic", lead.topic && CONTACT_TOPIC_LABEL[lead.topic]],
  ];
  const known = site.filter(([, v]) => v);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/leads"
        className="type-small text-muted hover:text-ink inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All leads
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="type-h1">{lead.contact.company ?? lead.contact.name}</h1>
            <StatusChip status={lead.status} />
          </div>
          <p className="text-muted">
            <span className="tabular">{lead.reference}</span>,{" "}
            {LEAD_SOURCE_LABEL[lead.source].toLowerCase()} received {formatDateTime(lead.createdAt)}
            {lead.demo && (
              <span className="bg-plaster-deep type-small ml-2 rounded-[var(--radius-pill)] px-2 py-0.5">
                Demo record
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="contact-title"
            className="bg-paper ring-line rounded-[var(--radius-md)] p-5 ring-1"
          >
            <h2 id="contact-title" className="mb-4 font-semibold">
              Contact
            </h2>
            <p className="font-semibold">{lead.contact.name}</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="flex items-center gap-2">
                <Mail className="text-muted size-4" aria-hidden />
                <a href={`mailto:${lead.contact.email}`} className="underline underline-offset-2">
                  {lead.contact.email}
                </a>
              </li>
              {lead.contact.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="text-muted size-4" aria-hidden />
                  <a
                    href={`tel:${lead.contact.phone.replace(/[^\d+]/g, "")}`}
                    className="tabular underline underline-offset-2"
                  >
                    {lead.contact.phone}
                  </a>
                </li>
              )}
            </ul>
            {lead.message && (
              <blockquote className="border-sun bg-plaster mt-5 border-l-4 px-4 py-3 whitespace-pre-line">
                {lead.message}
              </blockquote>
            )}
          </section>

          {known.length > 0 && (
            <section
              aria-labelledby="site-title"
              className="bg-paper ring-line rounded-[var(--radius-md)] p-5 ring-1"
            >
              <h2 id="site-title" className="mb-2 font-semibold">
                Site
              </h2>
              <dl className="divide-line divide-y">
                {known.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[11rem_1fr] gap-4 py-2.5">
                    <dt className="type-small text-muted">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {lead.estimate && (
            <section
              aria-labelledby="estimate-title"
              className="bg-ink text-paper rounded-[var(--radius-md)] p-5"
            >
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="estimate-title" className="font-semibold">
                  Estimate at submission
                </h2>
                <span className="type-small text-on-ink-muted">
                  “{INDEPENDENCE_RULES[lead.estimate.independence].label}”, recomputed on the server
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {[
                  ["System", formatKwp(lead.estimate.systemKwp)],
                  [
                    "Battery",
                    lead.estimate.batteryKwh
                      ? `${formatNumber(lead.estimate.batteryKwh)} kWh`
                      : "None",
                  ],
                  ["From solar", formatPercent(lead.estimate.solarShare)],
                  ["Saving / month", formatXof(lead.estimate.monthlySavingsXof)],
                  ["Investment", formatXof(lead.estimate.investmentMidXof)],
                  [
                    "Payback",
                    formatYears(lead.estimate.paybackLowYears, lead.estimate.paybackHighYears),
                  ],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="type-small text-on-ink-muted">{label}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
              {lead.site.segment && lead.site.location && (
                <Link
                  href={`/calculator${toEstimateQuery({
                    segment: lead.site.segment,
                    location: lead.site.location,
                    independence: lead.estimate.independence,
                    monthlyBillXof: lead.site.monthlyBillXof,
                    monthlyKwh: lead.site.monthlyKwh,
                    roofAreaM2: lead.site.roofAreaM2,
                    generatorHoursPerWeek: lead.site.generatorHoursPerWeek,
                  })}`}
                  target="_blank"
                  className="type-small text-sun mt-4 inline-block underline underline-offset-2"
                >
                  Open these inputs in the calculator
                  <span className="sr-only"> (opens in a new tab)</span>
                </Link>
              )}
            </section>
          )}
        </div>

        <LeadActions lead={lead} />
      </div>
    </div>
  );
}
