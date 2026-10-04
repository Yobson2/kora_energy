import "server-only";
import type { Project } from "@/app/lib/domain";
import type { ProjectInput } from "@/app/lib/validation";
import { newId } from "@/app/server/ids";
import { NotFoundError } from "@/app/server/leads";
import { getStore } from "@/app/server/store";

/**
 * Project (case study) repository. The public Projects pages and the back
 * office read the same records, so publishing in the back office is what
 * makes a case study appear on the site.
 */

export class ConflictError extends Error {}

export async function listProjects({ includeDrafts = false } = {}): Promise<Project[]> {
  const { projects } = await getStore().read();
  return projects
    .filter((p) => includeDrafts || p.published)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.year - a.year);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const { projects } = await getStore().read();
  return projects.find((p) => p.slug === slug && p.published);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const { projects } = await getStore().read();
  return projects.find((p) => p.id === id);
}

export async function createProject(input: ProjectInput): Promise<Project> {
  return getStore().update((data) => {
    if (data.projects.some((p) => p.slug === input.slug)) {
      throw new ConflictError("Another project already uses this address.");
    }
    const project: Project = { ...input, id: newId(), updatedAt: new Date().toISOString() };
    data.projects.push(project);
    return project;
  });
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
  return getStore().update((data) => {
    const project = data.projects.find((p) => p.id === id);
    if (!project) throw new NotFoundError("Project not found");
    if (input.slug && data.projects.some((p) => p.slug === input.slug && p.id !== id)) {
      throw new ConflictError("Another project already uses this address.");
    }
    Object.assign(project, input, { updatedAt: new Date().toISOString() });
    return project;
  });
}

export async function deleteProject(id: string): Promise<void> {
  await getStore().update((data) => {
    const index = data.projects.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundError("Project not found");
    data.projects.splice(index, 1);
  });
}
