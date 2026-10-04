import Link from "next/link";
import type { Project } from "@/app/lib/domain";
import { RoofPlan } from "@/app/components/visuals/roof-plan";
import { ConceptTag } from "@/app/components/primitives/section";
import { formatKwp, formatNumber, formatPercent } from "@/app/lib/format";
import { cn } from "@/app/lib/utils";

/**
 * A case study in a list. The whole card is one link (the title's ::after
 * stretches over it), so there is a single tab stop and a single, meaningful
 * accessible name instead of three "Read more" links.
 */
export function ProjectCard({
  project,
  headingLevel = 3,
  className,
}: {
  project: Project;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article
      className={cn(
        "group bg-paper ring-line hover:ring-ink relative flex flex-col rounded-[var(--radius-md)] ring-1 transition-shadow",
        "has-[a:focus-visible]:outline-sun has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2",
        className
      )}
    >
      <div className="bg-plaster aspect-[16/10] rounded-t-[var(--radius-md)] p-5">
        <RoofPlan
          roof={project.roof}
          systemKwp={project.systemKwp}
          caption={false}
          fill
          label={`Roof plan of the ${formatKwp(project.systemKwp)} array`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ConceptTag />
          <span className="type-small text-muted">{project.area}</span>
        </div>
        <Heading className="type-h3 text-balance">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {project.title}
          </Link>
        </Heading>
        <p className="type-small text-muted">{project.client}</p>
        <dl className="border-line mt-auto grid grid-cols-3 gap-3 border-t pt-4">
          <div>
            <dt className="type-small text-muted">Solar</dt>
            <dd className="tabular font-semibold">{formatKwp(project.systemKwp)}</dd>
          </div>
          <div>
            <dt className="type-small text-muted">Battery</dt>
            <dd className="tabular font-semibold">
              {project.batteryKwh ? `${formatNumber(project.batteryKwh)} kWh` : "None"}
            </dd>
          </div>
          <div>
            <dt className="type-small text-muted">From solar</dt>
            <dd className="tabular font-semibold">{formatPercent(project.solarShare)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
