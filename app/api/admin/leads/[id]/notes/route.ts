import type { NextRequest } from "next/server";
import { leadNoteSchema } from "@/app/lib/validation";
import { addLeadNote, NotFoundError } from "@/app/server/leads";
import { fail, internalError, ok, parseBody, requireAdmin } from "@/app/server/http";

type Context = { params: Promise<{ id: string }> };

/** POST /api/admin/leads/:id/notes { text } — add an internal note to the timeline. */
export async function POST(request: NextRequest, { params }: Context) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  const parsed = await parseBody(request, leadNoteSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const lead = await addLeadNote((await params).id, parsed.data.text, auth.session.name);
    return ok(lead, 201);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return fail(404, { code: "not_found", message: "This lead no longer exists." });
    }
    return internalError(error);
  }
}
