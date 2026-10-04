import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProjectForm } from "@/app/components/admin/project-form";
import { requireAdminPage } from "@/app/server/auth/current";
import { getProject } from "@/app/server/projects";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: Props) {
  await requireAdminPage();
  const { id } = await params;
  const project = id === "new" ? undefined : await getProject(id);
  if (id !== "new" && !project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/projects"
        className="type-small text-muted hover:text-ink inline-flex w-fit items-center gap-1"
      >
        <ChevronLeft className="size-4" aria-hidden />
        All projects
      </Link>
      <h1 className="type-h1">{project ? project.client : "New project"}</h1>
      <ProjectForm project={project} />
    </div>
  );
}
