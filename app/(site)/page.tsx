import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/app/components/primitives/container";
import { ButtonLink } from "@/app/components/primitives/button";
import { Section, SectionHeading } from "@/app/components/primitives/section";
import { Disclosure } from "@/app/components/primitives/disclosure";
import { HeroCurve } from "@/app/components/home/hero-curve";
import { QuickEstimate } from "@/app/components/home/quick-estimate";
import { ProjectCard } from "@/app/components/projects/project-card";
import { solutions } from "@/app/content/solutions";
import { featuredFaq } from "@/app/content/faq";
import { listProjects } from "@/app/server/projects";
import { pageMetadata } from "@/app/lib/metadata";
import { siteConfig } from "@/app/lib/site";
import { AmbientFilm } from "@/app/components/media/ambient-film";
import { PhotoFigure } from "@/app/components/media/photo";
import { films, photos } from "@/app/content/media";

export const metadata: Metadata = {
  ...pageMetadata({
    title: siteConfig.tagline,
    description: siteConfig.description,
    path: "/",
  }),
  title: { absolute: `${siteConfig.name} — ${siteConfig.tagline}` },
};

const CONTEXT_FIGURES = [
  {
    value: "1 300 kWh",
    text: "produced each year by a single kilowatt of panels in Abidjan — and up to 1 550 kWh in the north.",
  },
  {
    value: "12 hours",
    text: "of daylight on almost every day of the year, so a system sized in March still fits in August.",
  },
  {
    value: "3–6 years",
    text: "is a typical payback for a business that runs in the daytime, before any generator savings.",
  },
  {
    value: "25 years",
    text: "is how long quality panels are warrantied to keep producing at least 80 % of their output.",
  },
];

const STEPS = [
  {
    title: "Estimate your savings",
    time: "2 minutes",
    text: "Tell the calculator your bill and the kind of site you run. It shows a system size, a price range and a payback, with every assumption visible.",
  },
  {
    title: "Talk to a specialist",
    time: "Within 1 working day",
    text: "An energy specialist calls to understand what matters to you: lower bills, fewer outages, or both.",
  },
  {
    title: "Survey and proposal",
    time: "About 1–2 weeks",
    text: "We measure the roof, check the wiring and log your consumption, then send a fixed-price proposal with a production estimate.",
  },
  {
    title: "Install and monitor",
    time: "2–8 weeks after signing",
    text: "Installation is planned around your opening hours. From the first day, you can see what the system produces and saves.",
  },
];

const COMPARISON = [
  {
    topic: "Your electricity bill",
    before: "Rises with every tariff change, and you can't negotiate it.",
    after: "A large share is fixed at the cost of the system for 25 years.",
  },
  {
    topic: "When the grid drops",
    before: "The generator starts — if someone is there, and if there's diesel.",
    after: "The battery takes over protected circuits in milliseconds.",
  },
  {
    topic: "Knowing what you use",
    before: "One number a month, on a bill that arrives after the fact.",
    after: "Every main circuit, live on your phone, with alerts when something is off.",
  },
  {
    topic: "Your roof",
    before: "Unused space that heats the building below it.",
    after: "A productive asset that shades the roof while it works.",
  },
];

export default async function HomePage() {
  const featured = (await listProjects()).filter((p) => p.featured).slice(0, 3);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="bg-ink text-paper">
        <Container className="grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-24">
          <div className="flex flex-col gap-7">
            <h1 id="hero-title" className="type-display text-balance">
              Powering African businesses with smarter energy.
            </h1>
            <p className="type-lead text-on-ink-muted max-w-[52ch]">
              Kora Energy helps businesses cut their energy costs with reliable solar and battery
              systems, designed for the realities of West Africa: hot roofs, dusty seasons and a
              grid you can&apos;t always count on.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/calculator" variant="primary" size="lg">
                Calculate your savings
              </ButtonLink>
              <ButtonLink href="/quote" variant="on-ink" size="lg">
                Request a quote
              </ButtonLink>
            </div>
          </div>
          <HeroCurve />
        </Container>
      </section>

      {/* ── Context figures ──────────────────────────────────────────────── */}
      <section aria-labelledby="figures-title" className="bg-plaster border-line border-b">
        <Container className="py-12 md:py-14">
          <h2 id="figures-title" className="sr-only">
            Solar in Côte d&apos;Ivoire, in figures
          </h2>
          <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {CONTEXT_FIGURES.map((f) => (
              <div key={f.value} className="border-ink flex flex-col gap-3 border-t-2 pt-4">
                <dt className="type-figure">{f.value}</dt>
                <dd className="text-muted">{f.text}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ── Film band ────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="sun-title"
        className="bg-ink text-paper relative isolate overflow-hidden"
      >
        <AmbientFilm
          src={films.fieldDusk.src}
          poster={films.fieldDusk.poster}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        {/* Ink gradient from the bottom-left keeps the text at AA contrast
            over any frame of the film. */}
        <div
          aria-hidden
          className="from-ink via-ink/70 absolute inset-0 -z-10 bg-gradient-to-tr to-transparent"
        />
        <Container className="flex min-h-[28rem] flex-col justify-end gap-4 py-14 md:min-h-[34rem] md:py-20">
          <h2 id="sun-title" className="type-h1 max-w-3xl text-balance">
            The same sun reaches every roof in Côte d&apos;Ivoire.
          </h2>
          <p className="type-lead text-on-ink-muted max-w-[52ch]">
            Most of those roofs do nothing with it. For a business that works in daylight, that roof
            can carry a large share of the electricity it already pays for.
          </p>
          <p className="type-small text-on-ink-muted/80">
            Film:{" "}
            <a
              href={films.fieldDusk.credit.url}
              rel="noopener noreferrer"
              target="_blank"
              className="underline-offset-2 hover:underline"
            >
              {films.fieldDusk.credit.author}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </Container>
      </section>

      {/* ── Solutions ────────────────────────────────────────────────────── */}
      <Section labelledBy="solutions-title">
        <SectionHeading
          id="solutions-title"
          title="A system for the way your site uses energy"
          intro="A school, a hotel and a cold store can sit on the same street and need completely different systems. We start from your load, not from a catalogue."
        >
          <ButtonLink href="/solutions" variant="outline">
            Compare all solutions
          </ButtonLink>
        </SectionHeading>

        <ul className="border-line mt-12 border-t">
          {solutions.map((s) => (
            <li key={s.slug} className="border-line border-b">
              <Link
                href={`/solutions/${s.slug}`}
                className="group grid gap-1 py-5 md:grid-cols-[minmax(0,16rem)_1fr_auto] md:items-baseline md:gap-8 md:py-6"
              >
                <span className="type-h3 group-hover:text-sun-deep transition-colors">
                  {s.name}
                </span>
                <span className="text-muted">{s.summary}</span>
                <span className="type-small text-muted tabular md:text-right">{s.typical}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <Section tone="plaster" labelledBy="process-title">
        <SectionHeading
          id="process-title"
          title="From your bill to a working system"
          intro="Four steps, and you can stop after any of them. The first one takes two minutes and needs nothing but a recent bill."
        />
        <ol className="bg-line mt-12 grid gap-px overflow-hidden rounded-[var(--radius-md)] md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="bg-paper flex flex-col gap-3 p-6">
              <span className="type-figure-sm text-sun-deep tabular">{i + 1}</span>
              <h3 className="type-h3">{step.title}</h3>
              <p className="type-small text-ink font-semibold">{step.time}</p>
              <p className="text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <PhotoFigure
          photo={photos.installerWiring}
          ratio="21/8"
          sizes="(min-width: 1360px) 1264px, 100vw"
          caption="Illustrative photograph."
          className="mt-6"
        />
      </Section>

      {/* ── Calculator preview ───────────────────────────────────────────── */}
      <Section labelledBy="estimate-title">
        <SectionHeading
          id="estimate-title"
          title="What would solar save you?"
          intro="A first answer from two questions. The figures come from the same model our specialists start from."
          className="mb-10"
        />
        <QuickEstimate />
      </Section>

      {/* ── Before / after ───────────────────────────────────────────────── */}
      <Section tone="ink" labelledBy="change-title">
        <SectionHeading
          id="change-title"
          tone="dark"
          title="What changes when the sun does the work"
          intro="Solar is not only a cheaper kilowatt-hour. It changes how much you depend on things you don't control."
        />
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="sr-only">
              Running a site without solar compared with a Kora system
            </caption>
            <thead>
              <tr className="border-ink-line border-b">
                <th
                  scope="col"
                  className="type-small text-on-ink-muted w-[22%] py-3 pr-6 font-normal"
                >
                  <span className="sr-only">Topic</span>
                </th>
                <th scope="col" className="type-label text-on-ink-muted py-3 pr-6">
                  Today
                </th>
                <th scope="col" className="type-label text-sun py-3">
                  With a Kora system
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.topic} className="border-ink-line border-b align-top">
                  <th scope="row" className="py-5 pr-6 font-semibold">
                    {row.topic}
                  </th>
                  <td className="text-on-ink-muted py-5 pr-6">{row.before}</td>
                  <td className="py-5">{row.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Projects ─────────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <Section labelledBy="projects-title">
          <SectionHeading
            id="projects-title"
            title="Concept projects"
            intro="Kora Energy is fictional, so these are design studies rather than customer installations. Each one is worked through with real sizing logic, and the plans are drawn from its numbers."
          >
            <ButtonLink href="/projects" variant="outline">
              See all projects
            </ButtonLink>
          </SectionHeading>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </Section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <Section tone="plaster" labelledBy="faq-title">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <h2 id="faq-title" className="type-h2">
              Questions we hear on the first call
            </h2>
            <ButtonLink href="/faq" variant="outline">
              Read all questions
            </ButtonLink>
          </div>
          <div className="border-line border-b">
            {featuredFaq.map((item) => (
              <Disclosure key={item.question} summary={item.question} name="home-faq">
                {item.answer}
              </Disclosure>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section aria-labelledby="cta-title" className="bg-sun text-ink">
        <Container className="flex flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between md:py-20">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 id="cta-title" className="type-h1 text-balance">
              Find out what your roof is worth.
            </h2>
            <p className="type-lead">
              Start with an estimate, or ask for a quote and an energy specialist will be in touch
              within one working day.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/calculator" variant="secondary" size="lg">
              Calculate your savings
            </ButtonLink>
            <ButtonLink href="/quote" variant="outline" size="lg" className="on-sun">
              Request a quote
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
