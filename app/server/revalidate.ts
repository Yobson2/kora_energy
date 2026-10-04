import "server-only";
import { revalidatePath } from "next/cache";
import { LOCALES } from "@/app/lib/i18n";

/**
 * Public project pages are statically generated. When the back office changes
 * a project, the pages that show it are regenerated on their next request
 * the homepage (featured), the index, and the case study itself (both slugs,
 * if the address changed), in every language.
 *
 * Paths are the internal route paths under app/[lang] ("/en/projects"), which
 * is what the cache is keyed on, not the visible "/projects".
 */
export function revalidateProjects(...slugs: Array<string | undefined>) {
  for (const lang of LOCALES) {
    revalidatePath(`/${lang}`);
    revalidatePath(`/${lang}/projects`);
    for (const slug of new Set(slugs)) {
      if (slug) revalidatePath(`/${lang}/projects/${slug}`);
    }
  }
}
