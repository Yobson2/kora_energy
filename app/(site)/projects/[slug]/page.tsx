import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/primitives/page-header";
import { ConceptTag, Section } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { RoofPlan } from "@/app/components/visuals/roof-plan";
import { DayCurve } from "@/app/components/visuals/day-curve";
import { ProjectCard } from "@/app/components/projects/project-card";
import { getProjectBySlug, listProjects } from "@/app/server/projects";
import { simulateDay } from "@/app/lib/solar/estimate";
import { LOAD_SHAPE, LOCATION, SEGMENT_LABEL } from "@/app/lib/solar/assumptions";
import { panelCount } from "@/app/lib/solar/panel-layout";
import { toEstimateQuery } from "@/app/lib/estimate-query";
import { formatKwh, formatKwp, formatNumber, formatPercent } from "@/app/lib/format";
import { pageMetadata } from "@/app/lib/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await listProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.client}, ${project.area}`,
    description: `Concept project: ${project.summary}`,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectPage({ params }: Props) {
  const project = await getProjectBySlug((await params).slug);
  if (!project) notFound();

  // Reconstruct an illustrative day from the project's own figures: average
  // daily production, and a load implied by the stated solar share (assuming
  // ~95 % of production is used on site, as the sizing rule targets).
  const dailySolar = project.annualProductionKwh / 365;
  const dailyLoad = (dailySolar * 0.95) / Math.max(project.solarShare, 0.05);
  const day = simulateDay(dailyLoad, LOAD_SHAPE[project.segment], dailySolar, project.batteryKwh);

  const more = (await listProjects()).filter((p) => p.id !== project.id).slice(0, 3);

  const facts: Array<[string, string]> = [
    ["Solar array", formatKwp(project.systemKwp)],
    ["Battery", project.batteryKwh ? `${formatNumber(project.batteryKwh)} kWh` : "None"],
    ["Panels", formatNumber(panelCount(project.systemKwp))],
    ["Production", `${formatKwh(project.annualProductionKwh)} / yr`],
    ["Load from solar", formatPercent(project.solarShare)],
    ["CO₂ avoided", `${formatNumber(project.co2TonnesPerYear)} t / yr`],
  ];

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Projects", path: "/projects" },
          { name: project.client, path: `/projects/${project.slug}` },
        ]}
        title={project.title}
        lead={project.summary}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ConceptTag>Concept project, not a real installation</ConceptTag>
          <span className="type-small text-muted">
            {project.client} in {project.area}, studied in {project.year}
          </span>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="type-h3">Roof plan</h2>
            <div className="bg-plaster rounded-[var(--radius-md)] p-5 md:p-8">
              <RoofPlan
                roof={project.roof}
                systemKwp={project.systemKwp}
                label={`Plan of ${formatNumber(panelCount(project.systemKwp))} panels on a ${project.roof.width} by ${project.roof.depth} metre roof`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="type-h3">The system</h2>
            <dl className="border-line grid grid-cols-2 border-t">
              {facts.map(([label, value]) => (
                <div key={label} className="border-line flex flex-col gap-1 border-b py-4 pr-4">
                  <dt className="type-small text-muted">{label}</dt>
                  <dd className="type-figure-sm">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="type-small text-muted">
              Location: {LOCATION[project.location].label}, where a kilowatt of panels produces
              about {formatNumber(LOCATION[project.location].yieldKwhPerKwp)} kWh a year.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="plaster">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="type-h2">The challenge</h2>
              <p className="type-lead text-muted">{project.challenge}</p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="type-h2">The design</h2>
              <p className="type-lead text-muted">{project.approach}</p>
            </div>
          </div>
          <div className="bg-paper flex h-fit flex-col gap-4 rounded-[var(--radius-md)] p-6 md:p-8">
            <h2 className="type-h3">A modelled average day</h2>
            <DayCurve
              day={day}
              title={`Modelled average day for the ${project.client.toLowerCase()}`}
            />
            <p className="type-small text-muted">
              Reconstructed from the study&apos;s production and solar share with a typical{" "}
              {SEGMENT_LABEL[project.segment].toLowerCase()} load profile.
            </p>
          </div>
        </div>
      </Section>

      {project.results.length > 0 && (
        <Section labelledBy="results-title">
          <h2 id="results-title" className="type-h2">
            Modelled results
          </h2>
          <dl className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {project.results.map((r) => (
              <div key={r.label} className="border-ink flex flex-col-reverse gap-2 border-t-2 pt-5">
                <dt className="text-muted">{r.label}</dt>
                <dd className="type-figure">{r.value}</dd>
              </div>
            ))}
          </dl>
          <div className="bg-plaster mt-14 flex flex-col gap-4 rounded-[var(--radius-md)] p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <p className="max-w-[52ch]">
              Run the same model for a {SEGMENT_LABEL[project.segment].toLowerCase()} of your own.
            </p>
            <ButtonLink
              href={`/calculator${toEstimateQuery({ segment: project.segment, location: project.location })}`}
              variant="primary"
            >
              Calculate your savings
            </ButtonLink>
          </div>
        </Section>
      )}

      {more.length > 0 && (
        <Section tone="plaster" labelledBy="more-title">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 id="more-title" className="type-h2">
              More concept projects
            </h2>
            <Link href="/projects" className="font-semibold underline underline-offset-4">
              All projects
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
