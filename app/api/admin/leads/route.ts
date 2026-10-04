import type { NextRequest } from "next/server";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABEL,
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type Lead,
  type LeadSource,
  type LeadStatus,
} from "@/app/lib/domain";
import { LOCATION, SEGMENT_LABEL } from "@/app/lib/solar/assumptions";
import { listLeads } from "@/app/server/leads";
import { internalError, ok, requireAdmin } from "@/app/server/http";

/**
 * GET /api/admin/leads?status=open|new|…&source=quote|…&q=text[&format=csv]
 *
 * JSON by default. `format=csv` downloads the same filtered list for the
 * spreadsheet the sales team inevitably keeps.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const source = params.get("source");

  try {
    const leads = await listLeads({
      status:
        status === "open" || LEAD_STATUSES.includes(status as LeadStatus)
          ? (status as LeadStatus | "open")
          : undefined,
      source: LEAD_SOURCES.includes(source as LeadSource) ? (source as LeadSource) : undefined,
      q: params.get("q") ?? undefined,
    });

    if (params.get("format") === "csv") {
      const date = new Date().toISOString().slice(0, 10);
      return new Response(toCsv(leads), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="kora-leads-${date}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return ok(leads);
  } catch (error) {
    return internalError(error);
  }
}

/**
 * Quotes every cell and neutralises leading = + - @ so a name like
 * "=HYPERLINK(…)" submitted through a public form cannot execute as a
 * formula when the export is opened in a spreadsheet. Plain numbers and
 * phone numbers ("+225 07 …", "-12.5") contain nothing executable and are
 * left as they are.
 */
function cell(value: unknown): string {
  let text = value === undefined || value === null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text) && !/^[+-]?[\d\s().]+$/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(leads: Lead[]): string {
  const header = [
    "Reference",
    "Received",
    "Source",
    "Status",
    "Name",
    "Company",
    "Email",
    "Phone",
    "Site type",
    "Location",
    "Monthly bill (FCFA)",
    "Monthly kWh",
    "Estimated kWp",
    "Estimated battery kWh",
    "Estimated investment (FCFA)",
  ];
  const rows = leads.map((l) => [
    l.reference,
    l.createdAt,
    LEAD_SOURCE_LABEL[l.source],
    LEAD_STATUS_LABEL[l.status],
    l.contact.name,
    l.contact.company,
    l.contact.email,
    l.contact.phone,
    l.site.segment ? SEGMENT_LABEL[l.site.segment] : "",
    l.site.location ? LOCATION[l.site.location].label : "",
    l.site.monthlyBillXof,
    l.site.monthlyKwh,
    l.estimate?.systemKwp,
    l.estimate?.batteryKwh,
    l.estimate?.investmentMidXof,
  ]);
  // BOM so Excel opens accented names (N'Guessan, Bouaké) correctly.
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}
