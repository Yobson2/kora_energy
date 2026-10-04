import type { MetadataRoute } from "next";
import { siteConfig } from "@/app/lib/site";
import { LOCALES, localizePath } from "@/app/lib/i18n";
import { SOLUTION_SLUGS } from "@/app/lib/domain";
import { listProjects } from "@/app/server/projects";

/**
 * Built from the same sources as the routes themselves, so it cannot list a
 * page that doesn't exist or miss one that does. Unpublished projects are
 * excluded because listProjects() excludes them. Every page is listed once
 * per language, each entry naming its translations.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const page = (path: string, priority: number, lastModified = now) =>
    LOCALES.map((locale) => ({
      url: `${siteConfig.url}${localizePath(path, locale)}`,
      lastModified,
      priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${siteConfig.url}${localizePath(path, l)}`])
        ),
      },
    }));

  const projects = await listProjects();

  return [
    ...page("/", 1),
    ...page("/calculator", 0.9),
    ...page("/quote", 0.9),
    ...page("/solutions", 0.8),
    ...SOLUTION_SLUGS.flatMap((slug) => page(`/solutions/${slug}`, 0.7)),
    ...page("/projects", 0.7),
    ...projects.flatMap((p) => page(`/projects/${p.slug}`, 0.6, new Date(p.updatedAt))),
    ...page("/financing", 0.6),
    ...page("/about", 0.5),
    ...page("/faq", 0.5),
    ...page("/contact", 0.5),
    ...page("/privacy", 0.2),
  ];
}
