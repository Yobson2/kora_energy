import type { NextRequest } from "next/server";
import { estimate, EstimateInputError } from "@/app/lib/solar/estimate";
import { estimateInputSchema } from "@/app/lib/validation";
import {
  clientIp,
  fail,
  internalError,
  ok,
  parseBody,
  rateLimit,
  rateLimitedResponse,
} from "@/app/server/http";

/**
 * POST /api/estimates — run the solar estimator.
 *
 * Stateless: nothing is stored. The website calculator runs the same engine in
 * the browser for instant feedback; this endpoint exists so other clients (a
 * sales tablet app, a partner integration) get the identical numbers. It
 * skips the same-origin check the form endpoints use, because it reads
 * nothing and writes nothing.
 */
export async function POST(request: NextRequest) {
  const limit = rateLimit(`estimate:${clientIp(request)}`, 60, 60_000);
  if (!limit.allowed) return rateLimitedResponse(limit.retryAfter);

  const parsed = await parseBody(request, estimateInputSchema);
  if ("response" in parsed) return parsed.response;

  try {
    return ok(estimate(parsed.data));
  } catch (error) {
    if (error instanceof EstimateInputError) {
      return fail(422, { code: "unprocessable", message: error.message });
    }
    return internalError(error);
  }
}
