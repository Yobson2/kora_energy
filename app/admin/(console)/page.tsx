import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { StatusChip } from "@/app/components/admin/status-chip";
import { requireAdminPage } from "@/app/server/auth/current";
import { pipelineSummary } from "@/app/server/leads";
import {
  LEAD_SOURCE_LABEL,
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  OPEN_STATUSES,
} from "@/app/lib/domain";
import { formatAge, formatKwp, formatPercent, formatXofCompact } from "@/app/lib/format";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const session = await requireAdminPage();
  const s = await pipelineSummary();
  const funnelMax = Math.max(1, ...OPEN_STATUSES.map((st) => s.byStatus[st]));
  const sourceMax = Math.max(1, ...Object.values(s.bySource));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="type-h1">Overview</h1>
        <p className="text-muted">
          Good to see you, {session.name}. Here&apos;s what needs attention.
        </p>
      </header>

      {/* What needs doing comes first — a dashboard is a to-do list before it is a report. */}
      <section
        aria-labelledby="overdue-title"
        className="bg-paper ring-line rounded-[var(--radius-md)] ring-1"
      >
        <div className="border-line flex items-center justify-between gap-4 border-b px-5 py-4">
          <h2 id="overdue-title" className="flex items-center gap-2 font-semibold">
            {s.overdue.length > 0 && <AlertTriangle className="text-laterite size-5" aria-hidden />}
            Waiting more than a day for a reply
          </h2>
          <span className="type-small text-muted tabular">{s.overdue.length}</span>
        </div>
        {s.overdue.length ? (
          <ul className="divide-line divide-y">
            {s.overdue.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="hover:bg-plaster flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3"
                >
                  <span className="font-semibold">{lead.contact.company ?? lead.contact.name}</span>
                  <span className="type-small text-muted">
                    {LEAD_SOURCE_LABEL[lead.source]}, received {formatAge(lead.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted px-5 py-6">
            Nothing overdue. Every new lead has been answered within a day.
          </p>
        )}
      </section>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Open leads",
            value: String(s.openCount),
            detail: `${s.byStatus.new} not yet contacted`,
          },
          {
            label: "Capacity in pipeline",
            value: formatKwp(s.pipelineKwp),
            detail: "estimated, open leads",
          },
          {
            label: "Value in pipeline",
            value: formatXofCompact(s.pipelineValueXof),
            detail: "estimated investment",
          },
          {
            label: "Win rate",
            value: s.winRate === undefined ? "—" : formatPercent(s.winRate),
            detail: `${s.byStatus.won} won, ${s.byStatus.lost} lost`,
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-paper ring-line flex flex-col gap-1 rounded-[var(--radius-md)] p-5 ring-1"
          >
            <dt className="type-small text-muted">{k.label}</dt>
            <dd className="type-figure-sm">{k.value}</dd>
            <dd className="type-small text-muted">{k.detail}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 xl:grid-cols-2">
        <section
          aria-labelledby="funnel-title"
          className="bg-paper ring-line flex flex-col gap-5 rounded-[var(--radius-md)] p-5 ring-1"
        >
          <h2 id="funnel-title" className="font-semibold">
            Pipeline by stage
          </h2>
          <ul className="flex flex-col gap-3">
            {OPEN_STATUSES.map((status) => (
              <li key={status}>
                <Link
                  href={`/admin/leads?status=${status}`}
                  className="group grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3"
                >
                  <span className="type-small group-hover:underline">
                    {LEAD_STATUS_LABEL[status]}
                  </span>
                  <span className="bg-plaster h-5 overflow-hidden rounded-[var(--radius-xs)]">
                    <span
                      className="bg-lagoon block h-full"
                      style={{ width: `${(s.byStatus[status] / funnelMax) * 100}%` }}
                    />
                  </span>
                  <span className="tabular text-right font-semibold">{s.byStatus[status]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="source-title"
          className="bg-paper ring-line flex flex-col gap-5 rounded-[var(--radius-md)] p-5 ring-1"
        >
          <h2 id="source-title" className="font-semibold">
            Where leads came from, last 30 days
          </h2>
          <ul className="flex flex-col gap-3">
            {(Object.keys(s.bySource) as Array<keyof typeof s.bySource>).map((source) => (
              <li key={source} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3">
                <span className="type-small">{LEAD_SOURCE_LABEL[source]}</span>
                <span className="bg-plaster h-5 overflow-hidden rounded-[var(--radius-xs)]">
                  <span
                    className="bg-sun block h-full"
                    style={{ width: `${(s.bySource[source] / sourceMax) * 100}%` }}
                  />
                </span>
                <span className="tabular text-right font-semibold">{s.bySource[source]}</span>
              </li>
            ))}
          </ul>
          <p className="type-small text-muted mt-auto">
            {s.newLast30} leads in total over the period.
          </p>
        </section>
      </div>

      <section
        aria-labelledby="recent-title"
        className="bg-paper ring-line rounded-[var(--radius-md)] ring-1"
      >
        <div className="border-line flex items-center justify-between border-b px-5 py-4">
          <h2 id="recent-title" className="font-semibold">
            Latest activity
          </h2>
          <Link
            href="/admin/leads"
            className="type-small font-semibold underline underline-offset-2"
          >
            All leads
          </Link>
        </div>
        <ul className="divide-line divide-y">
          {s.recent.map((lead) => (
            <li key={lead.id}>
              <Link
                href={`/admin/leads/${lead.id}`}
                className="hover:bg-plaster grid gap-1 px-5 py-3 sm:grid-cols-[1fr_auto_6rem] sm:items-center sm:gap-6"
              >
                <span>
                  <span className="font-semibold">{lead.contact.company ?? lead.contact.name}</span>
                  <span className="type-small text-muted"> {lead.reference}</span>
                </span>
                <StatusChip status={lead.status} />
                <span className="type-small text-muted sm:text-right">
                  {formatAge(lead.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="type-small text-muted">
        Stages: {LEAD_STATUSES.map((st) => LEAD_STATUS_LABEL[st]).join(", ")}. A lead becomes a
        customer when it is marked Won.
      </p>
    </div>
  );
}
