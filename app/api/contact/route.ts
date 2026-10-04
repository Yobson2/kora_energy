import type { NextRequest } from "next/server";
import { contactSchema } from "@/app/lib/validation";
import { createContactLead } from "@/app/server/leads";
import { notifyNewLead } from "@/app/server/notify";
import {
  clientIp,
  crossOriginResponse,
  internalError,
  ok,
  parseBody,
  rateLimit,
  rateLimitedResponse,
  sameOrigin,
} from "@/app/server/http";

/** POST /api/contact — send a message to the team. Same contract as /api/quotes. */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return crossOriginResponse();

  const limit = rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60_000);
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfter);

  const parsed = await parseBody(request, contactSchema);
  if ("response" in parsed) return parsed.response;

  if (parsed.data.website) return ok({ reference: "KE-0000-0000" }, 201);

  try {
    const lead = await createContactLead(parsed.data);
    await notifyNewLead(lead);
    return ok({ reference: lead.reference }, 201);
  } catch (error) {
    return internalError(error);
  }
}
