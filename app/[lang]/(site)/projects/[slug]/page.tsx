import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/primitives/page-header";
import { ConceptTag, Section } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { Link } from "@/app/components/primitives/link";
import { RoofPlan } from "@/app/components/visuals/roof-plan";
import { DayCurve } from "@/app/components/visuals/day-curve";
import { ProjectCard } from "@/app/components/projects/project-card";
import { getProjectBySlug, listProjects } from "@/app/server/projects";
import { labels } from "@/app/content/labels";
import { simulateDay } from "@/app/lib/solar/estimate";
import { LOAD_SHAPE, LOCATION } from "@/app/lib/solar/assumptions";
import { panelCount } from "@/app/lib/solar/panel-layout";
import { toEstimateQuery } from "@/app/lib/estimate-query";
import { formatKwh, formatKwp, formatNumber, formatPercent } from "@/app/lib/format";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import { projectCopy } from "@/app/lib/project-copy";
import type { Locale } from "@/app/lib/i18n";

type Props = PageProps<"/[lang]/projects/[slug]">;

export async function generateStaticParams() {
  return (await listProjects()).map((p) => ({ slug: p.slug }));
}

type Copy = {
  crumb: string;
  conceptPrefix: string;
  tag: string;
  studied: (client: string, area: string, year: number) => string;
  roofPlan: string;
  planLabel: (panels: string, w: number, d: number) => string;
  system: string;
  facts: {
    array: string;
    battery: string;
    none: string;
    panels: string;
    production: string;
    share: string;
    co2: string;
    perYear: string;
  };
  location: (place: string, yieldKwh: string) => string;
  challenge: string;
  design: string;
  day: string;
  dayTitle: (client: string) => string;
  dayNote: (site: string) => string;
  results: string;
  runModel: (siteWithArticle: string) => string;
  calculate: string;
  more: string;
  all: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    crumb: "Projects",
    conceptPrefix: "Concept project: ",
    tag: "Concept project, not a real installation",
    studied: (client, area, year) => `${client} in ${area}, studied in ${year}`,
    roofPlan: "Roof plan",
    planLabel: (panels, w, d) => `Plan of ${panels} panels on a ${w} by ${d} metre roof`,
    system: "The system",
    facts: {
      array: "Solar array",
      battery: "Battery",
      none: "None",
      panels: "Panels",
      production: "Production",
      share: "Load from solar",
      co2: "CO₂ avoided",
      perYear: "/ yr",
    },
    location: (place, y) =>
      `Location: ${place}, where a kilowatt of panels produces about ${y} kWh a year.`,
    challenge: "The challenge",
    design: "The design",
    day: "A modelled average day",
    dayTitle: (client) => `Modelled average day for the ${client.toLowerCase()}`,
    dayNote: (site) =>
      `Reconstructed from the study's production and solar share with a typical ${site} load profile.`,
    results: "Modelled results",
    runModel: (site) => `Run the same model for ${site} of your own.`,
    calculate: "Calculate your savings",
    more: "More concept projects",
    all: "All projects",
  },
  fr: {
    crumb: "Projets",
    conceptPrefix: "Projet fictif : ",
    tag: "Projet fictif, pas une vraie installation",
    studied: (client, area, year) => `${client} à ${area}, étude ${year}`,
    roofPlan: "Plan de toiture",
    planLabel: (panels, w, d) => `Plan de ${panels} panneaux sur un toit de ${w} mètres sur ${d}`,
    system: "Le système",
    facts: {
      array: "Centrale solaire",
      battery: "Batterie",
      none: "Aucune",
      panels: "Panneaux",
      production: "Production",
      share: "Part solaire",
      co2: "CO₂ évité",
      perYear: "/ an",
    },
    location: (place, y) =>
      `Lieu : ${place}, où un kilowatt de panneaux produit environ ${y} kWh par an.`,
    challenge: "Le défi",
    design: "La conception",
    day: "Une journée moyenne modélisée",
    dayTitle: (client) => `Journée moyenne modélisée : ${client}`,
    dayNote: (site) =>
      `Reconstituée à partir de la production et de la part solaire de l'étude, avec un profil de consommation type pour ${site}.`,
    results: "Résultats modélisés",
    runModel: () => "Lancez le même modèle avec les chiffres de votre propre site.",
    calculate: "Calculer vos économies",
    more: "Autres projets fictifs",
    all: "Tous les projets",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await pageLocale(params);
  const project = await getProjectBySlug((await params).slug);
  if (!project) return {};
  const copy = projectCopy(project, locale);
  return pageMetadata({
    title: `${copy.client}, ${copy.area}`,
    description: `${COPY[locale].conceptPrefix}${copy.summary}`,
    path: `/projects/${project.slug}`,
    locale,
  });
}

export default async function ProjectPage({ params }: Props) {
  const locale = await pageLocale(params);
  const project = await getProjectBySlug((await params).slug);
  if (!project) notFound();

  const t = COPY[locale];
  const l = labels(locale);
  const copy = projectCopy(project, locale);
  // A study with no translation keeps its English words, marked as English.
  const lang = copy.lang === locale ? undefined : copy.lang;

  // Reconstruct an illustrative day from the project's own figures: average
  // daily production, and a load implied by the stated solar share (assuming
  // ~95 % of production is used on site, as the sizing rule targets).
  const dailySolar = project.annualProductionKwh / 365;
  const dailyLoad = (dailySolar * 0.95) / Math.max(project.solarShare, 0.05);
  const day = simulateDay(dailyLoad, LOAD_SHAPE[project.segment], dailySolar, project.batteryKwh);

  const more = (await listProjects()).filter((p) => p.id !== project.id).slice(0, 3);
  const site =
    locale === "fr"
      ? l.segmentWithArticle[project.segment]
      : l.segment[project.segment].toLowerCase();

  const facts: Array<[string, string]> = [
    [t.facts.array, formatKwp(project.systemKwp, locale)],
    [
      t.facts.battery,
      project.batteryKwh ? `${formatNumber(project.batteryKwh)} kWh` : t.facts.none,
    ],
    [t.facts.panels, formatNumber(panelCount(project.systemKwp))],
    [t.facts.production, `${formatKwh(project.annualProductionKwh)} ${t.facts.perYear}`],
    [t.facts.share, formatPercent(project.solarShare)],
    [t.facts.co2, `${formatNumber(project.co2TonnesPerYear)} t ${t.facts.perYear}`],
  ];

  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[
          { name: t.crumb, path: "/projects" },
          { name: copy.client, path: `/projects/${project.slug}` },
        ]}
        title={copy.title}
        lead={<span lang={lang}>{copy.summary}</span>}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <ConceptTag>{t.tag}</ConceptTag>
          <span lang={lang} className="type-small text-muted">
            {t.studied(copy.client, copy.area, project.year)}
          </span>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <h2 className="type-h3">{t.roofPlan}</h2>
            <div className="bg-plaster rounded-[var(--radius-md)] p-5 md:p-8">
              <RoofPlan
                roof={project.roof}
                systemKwp={project.systemKwp}
                locale={locale}
                label={t.planLabel(
                  formatNumber(panelCount(project.systemKwp)),
                  project.roof.width,
                  project.roof.depth
                )}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="type-h3">{t.system}</h2>
            <dl className="border-line grid grid-cols-2 border-t">
              {facts.map(([label, value]) => (
                <div key={label} className="border-line flex flex-col gap-1 border-b py-4 pr-4">
                  <dt className="type-small text-muted">{label}</dt>
                  <dd className="type-figure-sm">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="type-small text-muted">
              {t.location(
                l.location[project.location],
                formatNumber(LOCATION[project.location].yieldKwhPerKwp)
              )}
            </p>
          </div>
        </div>
      </Section>

      <Section tone="plaster">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="type-h2">{t.challenge}</h2>
              <p lang={lang} className="type-lead text-muted">
                {copy.challenge}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="type-h2">{t.design}</h2>
              <p lang={lang} className="type-lead text-muted">
                {copy.approach}
              </p>
            </div>
          </div>
          <div className="bg-paper flex h-fit flex-col gap-4 rounded-[var(--radius-md)] p-6 md:p-8">
            <h2 className="type-h3">{t.day}</h2>
            <DayCurve day={day} locale={locale} title={t.dayTitle(copy.client)} />
            <p className="type-small text-muted">{t.dayNote(site)}</p>
          </div>
        </div>
      </Section>

      {copy.results.length > 0 && (
        <Section labelledBy="results-title">
          <h2 id="results-title" className="type-h2">
            {t.results}
          </h2>
          <dl lang={lang} className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {copy.results.map((r) => (
              <div key={r.label} className="border-ink flex flex-col-reverse gap-2 border-t-2 pt-5">
                <dt className="text-muted">{r.label}</dt>
                <dd className="type-figure">{r.value}</dd>
              </div>
            ))}
          </dl>
          <div className="bg-plaster mt-14 flex flex-col gap-4 rounded-[var(--radius-md)] p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <p className="max-w-[52ch]">{t.runModel(l.segmentWithArticle[project.segment])}</p>
            <ButtonLink
              href={`/calculator${toEstimateQuery({ segment: project.segment, location: project.location })}`}
              variant="primary"
            >
              {t.calculate}
            </ButtonLink>
          </div>
        </Section>
      )}

      {more.length > 0 && (
        <Section tone="plaster" labelledBy="more-title">
          <div className="mb-10 flex items-end justify-between gap-6">
            <h2 id="more-title" className="type-h2">
              {t.more}
            </h2>
            <Link href="/projects" className="font-semibold underline underline-offset-4">
              {t.all}
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {more.map((p) => (
              <ProjectCard key={p.id} project={p} locale={locale} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
