import Link from "next/link";
import type { Metadata } from "next";
import { Download, Search } from "lucide-react";
import { StatusChip } from "@/app/components/admin/status-chip";
import { buttonClasses } from "@/app/components/primitives/button";
import { requireAdminPage } from "@/app/server/auth/current";
import { listLeads } from "@/app/server/leads";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABEL,
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type LeadSource,
  type LeadStatus,
} from "@/app/lib/domain";
import { LOCATION, SEGMENT_LABEL } from "@/app/lib/solar/assumptions";
import { formatAge, formatKwp } from "@/app/lib/format";

export const metadata: Metadata = { title: "Leads" };

type Search = { status?: string; source?: string; q?: string };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireAdminPage();
  const params = await searchParams;

  const status =
    params.status === "open" || LEAD_STATUSES.includes(params.status as LeadStatus)
      ? (params.status as LeadStatus | "open")
      : undefined;
  const source = LEAD_SOURCES.includes(params.source as LeadSource)
    ? (params.source as LeadSource)
    : undefined;
  const q = params.q?.slice(0, 100);

  const leads = await listLeads({ status, source, q });
  const filtered = Boolean(status || source || q);

  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (source) query.set("source", source);
  if (q) query.set("q", q);
  query.set("format", "csv");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-h1">Leads</h1>
          <p className="text-muted">
            Every quote request, calculator hand-off and message, newest first.
          </p>
        </div>
        <a href={`/api/admin/leads?${query}`} className={buttonClasses({ variant: "outline" })}>
          <Download className="size-4" aria-hidden />
          Export CSV
        </a>
      </header>

      {/* A plain GET form: filters live in the URL, so a filtered view can be
          bookmarked or shared with a colleague, and works without JS. */}
      <form
        role="search"
        aria-label="Filter leads"
        className="bg-paper ring-line grid gap-3 rounded-[var(--radius-md)] p-4 ring-1 md:grid-cols-[1fr_12rem_12rem_auto] md:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="type-label">
            Search
          </label>
          <div className="relative">
            <Search
              className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Name, company, email or reference"
              className="ring-line focus-visible:ring-ink h-11 w-full rounded-[var(--radius-sm)] pr-3 pl-9 ring-1 ring-inset focus-visible:ring-2 focus-visible:outline-none"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="type-label">
            Stage
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="ring-line h-11 rounded-[var(--radius-sm)] px-3 ring-1 ring-inset"
          >
            <option value="">All stages</option>
            <option value="open">All open</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="source" className="type-label">
            Source
          </label>
          <select
            id="source"
            name="source"
            defaultValue={source ?? ""}
            className="ring-line h-11 rounded-[var(--radius-sm)] px-3 ring-1 ring-inset"
          >
            <option value="">All sources</option>
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s}>
                {LEAD_SOURCE_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={buttonClasses({ variant: "secondary" })}>
            Apply
          </button>
          {filtered && (
            <Link href="/admin/leads" className={buttonClasses({ variant: "ghost" })}>
              Clear
            </Link>
          )}
        </div>
      </form>

      <p className="type-small text-muted" role="status">
        {leads.length} {leads.length === 1 ? "lead" : "leads"}
        {filtered ? " match these filters" : ""}
      </p>

      {leads.length === 0 ? (
        <div className="bg-paper ring-line flex flex-col items-start gap-3 rounded-[var(--radius-md)] p-8 ring-1">
          <p className="font-semibold">
            {filtered ? "No leads match these filters." : "No leads yet."}
          </p>
          <p className="text-muted">
            {filtered
              ? "Try a different stage or source, or clear the search."
              : "Requests from the quote form, the calculator and the contact page will appear here."}
          </p>
          {filtered && (
            <Link href="/admin/leads" className="font-semibold underline underline-offset-2">
              Show all leads
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-paper ring-line overflow-x-auto rounded-[var(--radius-md)] ring-1">
          <table className="w-full min-w-[52rem] text-left">
            <thead className="border-line border-b">
              <tr className="type-small text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Lead
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Site
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Estimate
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Source
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Stage
                </th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Received
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-plaster/60 relative align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="font-semibold after:absolute after:inset-0"
                    >
                      {lead.contact.company ?? lead.contact.name}
                    </Link>
                    <div className="type-small text-muted">
                      {lead.contact.company ? `${lead.contact.name}, ` : ""}
                      <span className="tabular">{lead.reference}</span>
                    </div>
                  </td>
                  <td className="type-small px-4 py-3">
                    {lead.site.segment ? SEGMENT_LABEL[lead.site.segment] : ""}
                    <div className="text-muted">
                      {lead.site.location ? LOCATION[lead.site.location].label : ""}
                    </div>
                  </td>
                  <td className="type-small tabular px-4 py-3">
                    {lead.estimate ? formatKwp(lead.estimate.systemKwp) : ""}
                  </td>
                  <td className="type-small px-4 py-3">{LEAD_SOURCE_LABEL[lead.source]}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={lead.status} />
                  </td>
                  <td className="type-small text-muted px-4 py-3 text-right whitespace-nowrap">
                    {formatAge(lead.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
