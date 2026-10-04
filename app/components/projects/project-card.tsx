import { Link } from "@/app/components/primitives/link";
import type { Project } from "@/app/lib/domain";
import type { Locale } from "@/app/lib/i18n";
import { projectCopy } from "@/app/lib/project-copy";
import { RoofPlan } from "@/app/components/visuals/roof-plan";
import { ConceptTag } from "@/app/components/primitives/section";
import { formatKwp, formatNumber, formatPercent } from "@/app/lib/format";
import { cn } from "@/app/lib/utils";

const COPY: Record<
  Locale,
  {
    tag: string;
    plan: (kwp: string) => string;
    solar: string;
    battery: string;
    none: string;
    share: string;
  }
> = {
  en: {
    tag: "Concept project",
    plan: (kwp) => `Roof plan of the ${kwp} array`,
    solar: "Solar",
    battery: "Battery",
    none: "None",
    share: "From solar",
  },
  fr: {
    tag: "Projet fictif",
    plan: (kwp) => `Plan de toiture de la centrale de ${kwp}`,
    solar: "Solaire",
    battery: "Batterie",
    none: "Aucune",
    share: "Part solaire",
  },
};

/**
 * A case study in a list. The whole card is one link (the title's ::after
 * stretches over it), so there is a single tab stop and a single, meaningful
 * accessible name instead of three "Read more" links.
 */
export function ProjectCard({
  project,
  locale,
  headingLevel = 3,
  className,
}: {
  project: Project;
  locale: Locale;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const Heading = `h${headingLevel}` as const;
  const t = COPY[locale];
  const copy = projectCopy(project, locale);
  // Untranslated studies keep their English words, marked as such.
  const lang = copy.lang === locale ? undefined : copy.lang;
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
          locale={locale}
          label={t.plan(formatKwp(project.systemKwp, locale))}
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ConceptTag>{t.tag}</ConceptTag>
          <span lang={lang} className="type-small text-muted">
            {copy.area}
          </span>
        </div>
        <Heading lang={lang} className="type-h3 text-balance">
          <Link
            href={`/projects/${project.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {copy.title}
          </Link>
        </Heading>
        <p lang={lang} className="type-small text-muted">
          {copy.client}
        </p>
        <dl className="border-line mt-auto grid grid-cols-3 gap-3 border-t pt-4">
          <div>
            <dt className="type-small text-muted">{t.solar}</dt>
            <dd className="tabular font-semibold">{formatKwp(project.systemKwp, locale)}</dd>
          </div>
          <div>
            <dt className="type-small text-muted">{t.battery}</dt>
            <dd className="tabular font-semibold">
              {project.batteryKwh ? `${formatNumber(project.batteryKwh)} kWh` : t.none}
            </dd>
          </div>
          <div>
            <dt className="type-small text-muted">{t.share}</dt>
            <dd className="tabular font-semibold">{formatPercent(project.solarShare)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
