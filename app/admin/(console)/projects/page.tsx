import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { buttonClasses } from "@/app/components/primitives/button";
import { ProjectRowActions } from "@/app/components/admin/project-row-actions";
import { requireAdminPage } from "@/app/server/auth/current";
import { listProjects } from "@/app/server/projects";
import { SEGMENT_LABEL } from "@/app/lib/solar/assumptions";
import { formatDate, formatKwp } from "@/app/lib/format";

export const metadata: Metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  await requireAdminPage();
  const projects = await listProjects({ includeDrafts: true });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="type-h1">Projects</h1>
          <p className="text-muted">
            Case studies on the public site. Published projects appear on /projects; featured ones
            also appear on the homepage.
          </p>
        </div>
        <Link href="/admin/projects/new" className={buttonClasses({ variant: "primary" })}>
          <Plus className="size-4" aria-hidden />
          New project
        </Link>
      </header>

      {projects.length === 0 ? (
        <div className="bg-paper ring-line rounded-[var(--radius-md)] p-8 ring-1">
          <p className="font-semibold">No projects yet.</p>
          <p className="text-muted mt-1">
            Create the first case study  it stays a draft until you publish it.
          </p>
        </div>
      ) : (
        <div className="bg-paper ring-line overflow-x-auto rounded-[var(--radius-md)] ring-1">
          <table className="w-full min-w-[48rem] text-left">
            <thead className="border-line border-b">
              <tr className="type-small text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Project
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Size
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Updated
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  On the site
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              {projects.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="font-semibold underline-offset-2 hover:underline"
                    >
                      {p.client}
                    </Link>
                    <div className="type-small text-muted max-w-[28rem] truncate">{p.title}</div>
                  </td>
                  <td className="type-small px-4 py-3">{SEGMENT_LABEL[p.segment]}</td>
                  <td className="type-small tabular px-4 py-3">{formatKwp(p.systemKwp)}</td>
                  <td className="type-small text-muted px-4 py-3">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <ProjectRowActions
                      id={p.id}
                      slug={p.slug}
                      published={p.published}
                      featured={p.featured}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
