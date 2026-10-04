import type { NextRequest } from "next/server";
import { publicSchemas } from "@/app/lib/validation";
import { createQuoteLead } from "@/app/server/leads";
import { notifyNewLead } from "@/app/server/notify";
import {
  clientIp,
  crossOriginResponse,
  internalError,
  ok,
  parseBody,
  rateLimit,
  rateLimitedResponse,
  requestLocale,
  sameOrigin,
} from "@/app/server/http";

/**
 * POST /api/quotes  submit a quote request.
 *
 * 201 { data: { reference } }
 * 422 validation_failed, with per-field messages keyed like "contact.email"
 * 429 rate_limited
 *
 * Messages follow Accept-Language (the form sends the page language).
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return crossOriginResponse();
  const locale = requestLocale(request);

  const limit = rateLimit(`quote:${clientIp(request)}`, 5, 10 * 60_000);
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfter, locale);

  const parsed = await parseBody(request, publicSchemas(locale).quoteRequestSchema);
  if ("response" in parsed) return parsed.response;

  // Honeypot filled: answer exactly like a success so the bot learns nothing,
  // but store nothing and notify no one.
  if (parsed.data.website) return ok({ reference: "KE-0000-0000" }, 201);

  try {
    const lead = await createQuoteLead(
      parsed.data,
      parsed.data.origin === "calculator" ? "calculator" : "quote"
    );
    await notifyNewLead(lead);
    return ok({ reference: lead.reference }, 201);
  } catch (error) {
    return internalError(error, locale);
  }
}
