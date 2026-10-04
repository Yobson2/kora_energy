import type { NextRequest } from "next/server";
import { leadPatchSchema } from "@/app/lib/validation";
import { getLead, NotFoundError, updateLeadStatus } from "@/app/server/leads";
import { fail, internalError, ok, parseBody, requireAdmin } from "@/app/server/http";

type Context = { params: Promise<{ id: string }> };

/** GET /api/admin/leads/:id */
export async function GET(request: NextRequest, { params }: Context) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  const lead = await getLead((await params).id);
  return lead ? ok(lead) : fail(404, { code: "not_found", message: "This lead no longer exists." });
}

/** PATCH /api/admin/leads/:id { status } — move a lead through the pipeline. */
export async function PATCH(request: NextRequest, { params }: Context) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  const parsed = await parseBody(request, leadPatchSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const lead = await updateLeadStatus((await params).id, parsed.data.status, auth.session.name);
    return ok(lead);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return fail(404, { code: "not_found", message: "This lead no longer exists." });
    }
    return internalError(error);
  }
}
