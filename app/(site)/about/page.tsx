import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/app/components/primitives/container";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { pageMetadata } from "@/app/lib/metadata";
import { PhotoFigure } from "@/app/components/media/photo";
import { allCredits, photos } from "@/app/content/media";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Why Kora Energy exists: reliable, affordable electricity for West African businesses, designed from how each site really uses energy. A portfolio concept project.",
  path: "/about",
});

const PRINCIPLES = [
  {
    title: "Design from the load, not the catalogue",
    text: "A system is only as good as its match to the hours a site uses energy. We model that first, and size everything else from it.",
  },
  {
    title: "Show the working",
    text: "Every estimate lists its assumptions. When a number is uncertain we give a range, and we say what would make it more precise.",
  },
  {
    title: "Build for heat, dust and humidity",
    text: "Equipment is chosen and installed for the conditions it will live in: ventilated mounting, cleaning access, protected electronics.",
  },
  {
    title: "Measure after we leave",
    text: "Monitoring is part of every system, and we report each year against what we said the system would do.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "About", path: "/about" }]}
        title="Electricity a business can plan around"
        lead="Kora Energy exists to make reliable, affordable power an ordinary part of running a business in West Africa — starting in Côte d'Ivoire."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <h2 className="type-h2">The problem is reliability as much as access</h2>
          <div className="prose-kora type-lead text-muted">
            <p>
              Across sub-Saharan Africa, hundreds of millions of people still live without
              electricity. But for many businesses in the region&apos;s cities, the problem is
              different: they are connected, and still can&apos;t count on the supply. Côte
              d&apos;Ivoire has one of West Africa&apos;s most extensive grids, yet in 2021 a
              generation shortfall brought weeks of scheduled cuts to Abidjan.
            </p>
            <p>
              When the grid fails, businesses fall back on diesel generators — expensive per
              kilowatt-hour, noisy, polluting, and dependent on fuel arriving on time. When it
              works, electricity is still one of the few costs that rises every year and can&apos;t
              be negotiated.
            </p>
            <p>
              Meanwhile the sun rises at about six and sets at about six, almost every day of the
              year, over millions of square metres of flat roof that do nothing but heat the
              buildings beneath them.
            </p>
          </div>
        </div>
        <PhotoFigure
          photo={photos.roofDusk}
          ratio="21/9"
          sizes="(min-width: 1360px) 1264px, 100vw"
          caption="Illustrative photograph."
          className="mt-14 md:mt-20"
        />
      </Section>

      <Section tone="ink">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <h2 className="type-h2">What Kora does about it</h2>
          <div className="prose-kora type-lead text-on-ink-muted">
            <p>
              Solar panels and batteries are now cheap enough that, for a business that runs in the
              daytime, they usually pay for themselves in a few years. What is missing is rarely the
              hardware. It is the confidence that a system will be sized right, installed well and
              still working in ten years.
            </p>
            <p>
              Kora is built around that gap: an honest estimate before anyone visits, a survey that
              measures instead of guessing, systems designed for the climate, and monitoring that
              shows whether they deliver. The aim is productivity — a clinic that never loses its
              cold chain, a school whose computer lab runs every lesson, a factory whose costs stop
              moving.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="plaster" labelledBy="principles-title">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <PhotoFigure
            photo={photos.technicianSite}
            ratio="4/5"
            focus="82% 40%"
            sizes="(min-width: 1024px) 40vw, 100vw"
            caption="Illustrative photograph."
            className="lg:sticky lg:top-[calc(var(--spacing-header)+24px)]"
          />
          <div>
            <h2 id="principles-title" className="type-h2 max-w-2xl">
              How we work
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {PRINCIPLES.map((p) => (
                <li key={p.title} className="border-ink flex flex-col gap-2 border-t-2 pt-5">
                  <h3 className="type-h3">{p.title}</h3>
                  <p className="text-muted">{p.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="concept" labelledBy="concept-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div className="flex flex-col gap-4">
            <h2 id="concept-title" className="type-h2">
              About this project
            </h2>
            <p className="bg-sun-soft w-fit rounded-[var(--radius-sm)] px-3 py-1.5 font-semibold">
              Kora Energy is not a real company.
            </p>
          </div>
          <div className="prose-kora">
            <p>
              This website is a concept project, built to show how a real energy company in West
              Africa could present itself, qualify customers and run its sales pipeline. There is no
              company history, team or customer base to report, and none has been invented.
            </p>
            <h3>What is fictional</h3>
            <ul>
              <li>The company, its office, phone numbers and email addresses.</li>
              <li>
                The case studies, which are design studies for typical sites rather than real
                installations.
              </li>
              <li>Any implied offer of services or financing.</li>
            </ul>
            <h3>What is real</h3>
            <ul>
              <li>
                The estimation model: an hour-by-hour simulation using realistic, round-number
                assumptions for yield, tariffs and prices in Côte d&apos;Ivoire, all listed on the
                calculator page.
              </li>
              <li>
                The software: forms with server-side validation, a JSON API, a lead pipeline, and a
                back office where quote requests and case studies are managed.
              </li>
            </ul>
            <p>
              Anything you submit through the forms is stored only in the demonstration back office.
              See the <Link href="/privacy">privacy notice</Link>.
            </p>
            <h3 id="credits">Photography and film</h3>
            <p>
              Photographs and film are free-licence stock, used to show equipment and installation
              work in general. None of them shows a Kora project; the case studies are illustrated
              only with plans drawn from their own figures.
            </p>
            <ul>
              {allCredits.map(({ what, credit }) => (
                <li key={credit.url}>
                  {what}{" "}
                  <a href={credit.url} rel="noopener noreferrer" target="_blank">
                    {credit.author}, {credit.source}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <section className="bg-sun text-ink">
        <Container className="flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <p className="type-h3 max-w-xl">See what the model says about your own site.</p>
          <ButtonLink href="/calculator" variant="secondary" size="lg">
            Calculate your savings
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
