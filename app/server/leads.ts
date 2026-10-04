import "server-only";
import {
  OPEN_STATUSES,
  type Activity,
  type EstimateSnapshot,
  type Lead,
  type LeadSource,
  type LeadStatus,
  LEAD_STATUS_LABEL,
} from "@/app/lib/domain";
import { estimate, EstimateInputError } from "@/app/lib/solar/estimate";
import type { Independence } from "@/app/lib/solar/assumptions";
import type { ContactRequest, QuoteRequest } from "@/app/lib/validation";
import { newId, newReference } from "@/app/server/ids";
import { getStore } from "@/app/server/store";

/**
 * Lead repository: every way a lead is created, read or moved through the
 * pipeline. Routes call these functions; they never touch the store directly.
 */

function activity(kind: Activity["kind"], text: string, by: string): Activity {
  return { id: newId(), at: new Date().toISOString(), kind, text, by };
}

/**
 * Recomputes the estimate from the submitted inputs rather than trusting any
 * figure sent by the browser. Returns undefined if the inputs cannot produce
 * one (e.g. a tiny roof) — a quote request is still worth having without it.
 */
function snapshot(request: QuoteRequest): EstimateSnapshot | undefined {
  const independence: Independence =
    request.independence ?? (request.site.solution === "backup" ? "maximum" : "balanced");
  try {
    const r = estimate({
      segment: request.site.segment,
      location: request.site.location,
      independence,
      ...request.energy,
    });
    return {
      independence,
      systemKwp: r.systemKwp,
      batteryKwh: r.batteryKwh,
      solarShare: r.solarShare,
      monthlySavingsXof: r.monthlySavingsXof,
      investmentMidXof: r.investmentXof.mid,
      paybackLowYears: r.paybackYears.low,
      paybackHighYears: r.paybackYears.high,
    };
  } catch (error) {
    if (error instanceof EstimateInputError) return undefined;
    throw error;
  }
}

export async function createQuoteLead(
  request: QuoteRequest,
  source: LeadSource = "quote"
): Promise<Lead> {
  const now = new Date().toISOString();
  const lead: Lead = {
    id: newId(),
    reference: newReference(),
    createdAt: now,
    updatedAt: now,
    source,
    status: "new",
    contact: {
      name: request.contact.name,
      email: request.contact.email,
      phone: request.contact.phone,
      company: request.contact.company,
    },
    site: { ...request.site, ...request.energy },
    message: request.contact.message,
    estimate: snapshot(request),
    activity: [activity("created", "Quote request received", "Website")],
    consentAt: now,
  };
  await getStore().update((data) => {
    data.leads.unshift(lead);
  });
  return lead;
}

export async function createContactLead(request: ContactRequest): Promise<Lead> {
  const now = new Date().toISOString();
  const lead: Lead = {
    id: newId(),
    reference: newReference(),
    createdAt: now,
    updatedAt: now,
    source: "contact",
    status: "new",
    contact: {
      name: request.name,
      email: request.email,
      phone: request.phone,
      company: request.company,
    },
    site: {},
    topic: request.topic,
    message: request.message,
    activity: [activity("created", "Message received", "Website")],
    consentAt: now,
  };
  await getStore().update((data) => {
    data.leads.unshift(lead);
  });
  return lead;
}

export type LeadFilter = {
  status?: LeadStatus | "open";
  source?: LeadSource;
  q?: string;
};

export async function listLeads(filter: LeadFilter = {}): Promise<Lead[]> {
  const { leads } = await getStore().read();
  const q = filter.q?.trim().toLowerCase();

  return leads.filter((lead) => {
    if (filter.status === "open" && !OPEN_STATUSES.includes(lead.status)) return false;
    if (filter.status && filter.status !== "open" && lead.status !== filter.status) return false;
    if (filter.source && lead.source !== filter.source) return false;
    if (q) {
      const haystack = [
        lead.reference,
        lead.contact.name,
        lead.contact.email,
        lead.contact.company,
        lead.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export async function getLead(id: string): Promise<Lead | undefined> {
  const { leads } = await getStore().read();
  return leads.find((lead) => lead.id === id);
}

export class NotFoundError extends Error {}

export async function updateLeadStatus(id: string, status: LeadStatus, by: string): Promise<Lead> {
  return getStore().update((data) => {
    const lead = data.leads.find((l) => l.id === id);
    if (!lead) throw new NotFoundError("Lead not found");
    if (lead.status === status) return lead;
    lead.activity.push(
      activity(
        "status",
        `Moved from ${LEAD_STATUS_LABEL[lead.status]} to ${LEAD_STATUS_LABEL[status]}`,
        by
      )
    );
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    return lead;
  });
}

export async function addLeadNote(id: string, text: string, by: string): Promise<Lead> {
  return getStore().update((data) => {
    const lead = data.leads.find((l) => l.id === id);
    if (!lead) throw new NotFoundError("Lead not found");
    lead.activity.push(activity("note", text, by));
    lead.updatedAt = new Date().toISOString();
    return lead;
  });
}

/**
 * The numbers on the dashboard. Every figure is derived from leads — nothing
 * is a stored "statistic" that could drift from the records it summarises.
 */
export async function pipelineSummary(now = new Date()) {
  const { leads } = await getStore().read();
  const day = 86_400_000;
  const open = leads.filter((l) => OPEN_STATUSES.includes(l.status));

  const byStatus = Object.fromEntries(
    (["new", "contacted", "site-visit", "proposal", "won", "lost"] as const).map((s) => [
      s,
      leads.filter((l) => l.status === s).length,
    ])
  ) as Record<LeadStatus, number>;

  // A new lead older than one working day has waited too long for a reply.
  const overdue = leads
    .filter((l) => l.status === "new" && now.getTime() - Date.parse(l.createdAt) > day)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const last30 = leads.filter((l) => now.getTime() - Date.parse(l.createdAt) <= 30 * day);
  const bySource = {
    quote: last30.filter((l) => l.source === "quote").length,
    calculator: last30.filter((l) => l.source === "calculator").length,
    contact: last30.filter((l) => l.source === "contact").length,
  };

  const decided = byStatus.won + byStatus.lost;

  return {
    total: leads.length,
    openCount: open.length,
    byStatus,
    bySource,
    newLast30: last30.length,
    overdue,
    pipelineKwp: open.reduce((t, l) => t + (l.estimate?.systemKwp ?? 0), 0),
    pipelineValueXof: open.reduce((t, l) => t + (l.estimate?.investmentMidXof ?? 0), 0),
    winRate: decided ? byStatus.won / decided : undefined,
    recent: leads.slice(0, 6),
  };
}
