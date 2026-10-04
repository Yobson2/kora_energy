import type { NextRequest } from "next/server";
import { projectSchema } from "@/app/lib/validation";
import { NotFoundError } from "@/app/server/leads";
import { ConflictError, deleteProject, getProject, updateProject } from "@/app/server/projects";
import { fail, internalError, ok, parseBody, requireAdmin } from "@/app/server/http";
import { revalidateProjects } from "@/app/server/revalidate";

type Context = { params: Promise<{ id: string }> };

const notFound = () => fail(404, { code: "not_found", message: "This project no longer exists." });

/**
 * PATCH /api/admin/projects/:id  partial update. Sending only
 * { published: false } is how a case study is taken off the site.
 */
export async function PATCH(request: NextRequest, { params }: Context) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  const parsed = await parseBody(request, projectSchema.partial());
  if ("response" in parsed) return parsed.response;

  const { id } = await params;
  try {
    const before = await getProject(id);
    const project = await updateProject(id, parsed.data);
    revalidateProjects(project.slug, before?.slug);
    return ok(project);
  } catch (error) {
    if (error instanceof NotFoundError) return notFound();
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

/** DELETE /api/admin/projects/:id */
export async function DELETE(request: NextRequest, { params }: Context) {
  const auth = await requireAdmin(request);
  if ("response" in auth) return auth.response;

  const { id } = await params;
  try {
    const before = await getProject(id);
    await deleteProject(id);
    revalidateProjects(before?.slug);
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof NotFoundError) return notFound();
    return internalError(error);
  }
}
