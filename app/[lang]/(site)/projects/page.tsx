import type { Metadata } from "next";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { ProjectCard } from "@/app/components/projects/project-card";
import { listProjects } from "@/app/server/projects";
import { formatKwh, formatKwp, formatNumber } from "@/app/lib/format";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import type { Locale } from "@/app/lib/i18n";

const COPY: Record<
  Locale,
  {
    title: string;
    description: string;
    crumb: string;
    leadBefore: string;
    leadStrong: string;
    leadAfter: string;
    studies: string;
    capacity: string;
    production: string;
    perYear: string;
    all: string;
    co2: (tonnes: string) => string;
    emptyTitle: string;
    emptyText: string;
    calculate: string;
  }
> = {
  en: {
    title: "Concept projects",
    description:
      "Design studies for hotels, schools, warehouses, shops, clinics and homes in Côte d'Ivoire, each sized with the same model as the Kora calculator.",
    crumb: "Projects",
    leadBefore: "Kora Energy is a fictional company, so these are ",
    leadStrong: "design studies, not customer installations",
    leadAfter:
      ". Each is worked through with real sizing logic for a realistic site, and every plan is drawn from its own numbers.",
    studies: "Studies",
    capacity: "Combined capacity",
    production: "Modelled production",
    perYear: "/yr",
    all: "All projects",
    co2: (t) =>
      `Together the studies would avoid about ${t} tonnes of CO₂ a year, using a grid factor of 0.45 kg per kWh. Figures are modelled, not measured.`,
    emptyTitle: "No projects are published right now.",
    emptyText:
      "Case studies are being updated. In the meantime, the calculator shows what a system could look like for your own site.",
    calculate: "Calculate your savings",
  },
  fr: {
    title: "Projets fictifs",
    description:
      "Des études de conception pour des hôtels, écoles, entrepôts, commerces, cliniques et logements en Côte d'Ivoire, chacune dimensionnée avec le même modèle que le simulateur Kora.",
    crumb: "Projets",
    leadBefore: "Kora Energy est une entreprise fictive : ce sont donc des ",
    leadStrong: "études de conception, pas des installations clients",
    leadAfter:
      ". Chacune est calculée avec une vraie logique de dimensionnement pour un site réaliste, et chaque plan est tracé à partir de ses propres chiffres.",
    studies: "Études",
    capacity: "Puissance cumulée",
    production: "Production modélisée",
    perYear: "/an",
    all: "Tous les projets",
    co2: (t) =>
      `Ensemble, ces études éviteraient environ ${t} tonnes de CO₂ par an, avec un facteur réseau de 0,45 kg par kWh. Chiffres modélisés, non mesurés.`,
    emptyTitle: "Aucun projet n'est publié pour le moment.",
    emptyText:
      "Les études de cas sont en cours de mise à jour. En attendant, le simulateur montre à quoi pourrait ressembler un système pour votre propre site.",
    calculate: "Calculer vos économies",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  return pageMetadata({ title: t.title, description: t.description, path: "/projects", locale });
}

export default async function ProjectsPage({ params }: PageProps<"/[lang]/projects">) {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  const projects = await listProjects();
  const totals = projects.reduce(
    (sum, p) => ({
      kwp: sum.kwp + p.systemKwp,
      kwh: sum.kwh + p.annualProductionKwh,
      co2: sum.co2 + p.co2TonnesPerYear,
    }),
    { kwp: 0, kwh: 0, co2: 0 }
  );

  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[{ name: t.crumb, path: "/projects" }]}
        title={t.title}
        lead={
          <>
            {t.leadBefore}
            <strong className="text-ink">{t.leadStrong}</strong>
            {t.leadAfter}
          </>
        }
      >
        {projects.length > 0 && (
          <dl className="grid max-w-3xl grid-cols-3 gap-6 pt-2">
            <div>
              <dt className="type-small text-muted">{t.studies}</dt>
              <dd className="type-figure-sm">{projects.length}</dd>
            </div>
            <div>
              <dt className="type-small text-muted">{t.capacity}</dt>
              <dd className="type-figure-sm">{formatKwp(totals.kwp, locale)}</dd>
            </div>
            <div>
              <dt className="type-small text-muted">{t.production}</dt>
              <dd className="type-figure-sm">
                {formatKwh(totals.kwh)}
                {t.perYear}
              </dd>
            </div>
          </dl>
        )}
      </PageHeader>

      <Section>
        {projects.length > 0 ? (
          <>
            <h2 className="sr-only">{t.all}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} locale={locale} />
              ))}
            </div>
            <p className="type-small text-muted mt-10 max-w-[70ch]">
              {t.co2(formatNumber(totals.co2))}
            </p>
          </>
        ) : (
          <div className="bg-plaster flex flex-col items-start gap-4 rounded-[var(--radius-md)] p-8 md:p-12">
            <h2 className="type-h3">{t.emptyTitle}</h2>
            <p className="text-muted max-w-[52ch]">{t.emptyText}</p>
            <ButtonLink href="/calculator" variant="primary">
              {t.calculate}
            </ButtonLink>
          </div>
        )}
      </Section>
    </>
  );
}
