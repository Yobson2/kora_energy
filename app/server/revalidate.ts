import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Public project pages are statically generated. When the back office changes
 * a project, the pages that show it are regenerated on their next request —
 * the homepage (featured), the index, and the case study itself (both slugs,
 * if the address changed).
 */
export function revalidateProjects(...slugs: Array<string | undefined>) {
  revalidatePath("/");
  revalidatePath("/projects");
  for (const slug of new Set(slugs)) {
    if (slug) revalidatePath(`/projects/${slug}`);
  }
}
