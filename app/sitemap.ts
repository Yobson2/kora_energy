import type { MetadataRoute } from "next";
import { siteConfig } from "@/app/lib/site";
import { solutions } from "@/app/content/solutions";
import { listProjects } from "@/app/server/projects";

/**
 * Built from the same sources as the routes themselves, so it cannot list a
 * page that doesn't exist or miss one that does. Unpublished projects are
 * excluded because listProjects() excludes them.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const page = (path: string, priority: number) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    priority,
  });

  const projects = await listProjects();

  return [
    page("/", 1),
    page("/calculator", 0.9),
    page("/quote", 0.9),
    page("/solutions", 0.8),
    ...solutions.map((s) => page(`/solutions/${s.slug}`, 0.7)),
    page("/projects", 0.7),
    ...projects.map((p) => ({
      url: `${siteConfig.url}/projects/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      priority: 0.6,
    })),
    page("/financing", 0.6),
    page("/about", 0.5),
    page("/faq", 0.5),
    page("/contact", 0.5),
    page("/privacy", 0.2),
  ];
}
