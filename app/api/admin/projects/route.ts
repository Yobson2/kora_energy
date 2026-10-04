import type { NextRequest } from "next/server";
import { projectSchema } from "@/app/lib/validation";
import { ConflictError, createProject, listProjects } from "@/app/server/projects";
import { fail, internalError, ok, parseBody, requireAdmin } from "@/app/server/http";
import { revalidateProjects } from "@/app/server/revalidate";

/** GET /api/admin/projects  all projects, drafts included. */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;
  return ok(await listProjects({ includeDrafts: true }));
}

/** POST /api/admin/projects  create a case study. */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  const parsed = await parseBody(request, projectSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const project = await createProject(parsed.data);
    revalidateProjects(project.slug);
    return ok(project, 201);
  } catch (error) {
    if (error instanceof ConflictError) {
      return fail(409, {
        code: "conflict",
        message: error.message,
        fields: { slug: error.message },
      });
    }
    return internalError(error);
  }
}
