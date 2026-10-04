import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { ProjectCard } from "@/app/components/projects/project-card";
import { listProjects } from "@/app/server/projects";
import { formatKwh, formatKwp, formatNumber } from "@/app/lib/format";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Concept projects",
  description:
    "Design studies for hotels, schools, warehouses, shops, clinics and homes in Côte d'Ivoire — each sized with the same model as the Kora calculator.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await listProjects();
  const totals = projects.reduce(
    (t, p) => ({
      kwp: t.kwp + p.systemKwp,
      kwh: t.kwh + p.annualProductionKwh,
      co2: t.co2 + p.co2TonnesPerYear,
    }),
    { kwp: 0, kwh: 0, co2: 0 }
  );

  return (
    <>
      <PageHeader
        crumbs={[{ name: "Projects", path: "/projects" }]}
        title="Concept projects"
        lead={
          <>
            Kora Energy is a fictional company, so these are{" "}
            <strong className="text-ink">design studies, not customer installations</strong>. Each
            is worked through with real sizing logic for a realistic site, and every plan is drawn
            from its own numbers.
          </>
        }
      >
        {projects.length > 0 && (
          <dl className="grid max-w-3xl grid-cols-3 gap-6 pt-2">
            <div>
              <dt className="type-small text-muted">Studies</dt>
              <dd className="type-figure-sm">{projects.length}</dd>
            </div>
            <div>
              <dt className="type-small text-muted">Combined capacity</dt>
              <dd className="type-figure-sm">{formatKwp(totals.kwp)}</dd>
            </div>
            <div>
              <dt className="type-small text-muted">Modelled production</dt>
              <dd className="type-figure-sm">{formatKwh(totals.kwh)}/yr</dd>
            </div>
          </dl>
        )}
      </PageHeader>

      <Section>
        {projects.length > 0 ? (
          <>
            <h2 className="sr-only">All projects</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
            <p className="type-small text-muted mt-10 max-w-[70ch]">
              Together the studies would avoid about {formatNumber(totals.co2)} tonnes of CO₂ a
              year, using a grid factor of 0.45 kg per kWh. Figures are modelled, not measured.
            </p>
          </>
        ) : (
          <div className="bg-plaster flex flex-col items-start gap-4 rounded-[var(--radius-md)] p-8 md:p-12">
            <h2 className="type-h3">No projects are published right now.</h2>
            <p className="text-muted max-w-[52ch]">
              Case studies are being updated. In the meantime, the calculator shows what a system
              could look like for your own site.
            </p>
            <ButtonLink href="/calculator" variant="primary">
              Calculate your savings
            </ButtonLink>
          </div>
        )}
      </Section>
    </>
  );
}
