import type { Metadata } from "next";
import { Container } from "@/app/components/primitives/container";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { Link } from "@/app/components/primitives/link";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import type { Locale } from "@/app/lib/i18n";
import { PhotoFigure } from "@/app/components/media/photo";
import { allCredits, photos } from "@/app/content/media";

const en = {
  metaTitle: "About",
  description:
    "Why Kora Energy exists: reliable, affordable electricity for West African businesses, designed from how each site really uses energy. A portfolio concept project.",
  title: "Electricity a business can plan around",
  lead: "Kora Energy exists to make reliable, affordable power an ordinary part of running a business in West Africa, starting in Côte d'Ivoire.",
  problemTitle: "The problem is reliability as much as access",
  problem: [
    "Across sub-Saharan Africa, hundreds of millions of people still live without electricity. But for many businesses in the region's cities, the problem is different: they are connected, and still can't count on the supply. Côte d'Ivoire has one of West Africa's most extensive grids, yet in 2021 a generation shortfall brought weeks of scheduled cuts to Abidjan.",
    "When the grid fails, businesses fall back on diesel generators: expensive per kilowatt-hour, noisy, polluting, and dependent on fuel arriving on time. When it works, electricity is still one of the few costs that rises every year and can't be negotiated.",
    "Meanwhile the sun rises at about six and sets at about six, almost every day of the year, over millions of square metres of flat roof that do nothing but heat the buildings beneath them.",
  ],
  caption: "Illustrative photograph.",
  whatTitle: "What Kora does about it",
  what: [
    "Solar panels and batteries are now cheap enough that, for a business that runs in the daytime, they usually pay for themselves in a few years. What is missing is rarely the hardware. It is the confidence that a system will be sized right, installed well and still working in ten years.",
    "Kora is built around that gap: an honest estimate before anyone visits, a survey that measures instead of guessing, systems designed for the climate, and monitoring that shows whether they deliver. The aim is productivity: a clinic that never loses its cold chain, a school whose computer lab runs every lesson, a factory whose costs stop moving.",
  ],
  principlesTitle: "How we work",
  principles: [
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
  ],
  concept: {
    title: "About this project",
    badge: "Kora Energy is not a real company.",
    intro:
      "This website is a concept project, built to show how a real energy company in West Africa could present itself, qualify customers and run its sales pipeline. There is no company history, team or customer base to report, and none has been invented.",
    fictionalTitle: "What is fictional",
    fictional: [
      "The company, its office, phone numbers and email addresses.",
      "The case studies, which are design studies for typical sites rather than real installations.",
      "Any implied offer of services or financing.",
    ],
    realTitle: "What is real",
    real: [
      "The estimation model: an hour-by-hour simulation using realistic, round-number assumptions for yield, tariffs and prices in Côte d'Ivoire, all listed on the calculator page.",
      "The software: forms with server-side validation, a JSON API, a lead pipeline, and a back office where quote requests and case studies are managed.",
    ],
    storedBefore:
      "Anything you submit through the forms is stored only in the demonstration back office. See the ",
    privacyLink: "privacy notice",
    storedAfter: ".",
    creditsTitle: "Photography and film",
    credits:
      "Photographs and film are free-licence stock, used to show equipment and installation work in general. None of them shows a Kora project; the case studies are illustrated only with plans drawn from their own figures.",
    newTab: " (opens in a new tab)",
  },
  cta: "See what the model says about your own site.",
  calculate: "Calculate your savings",
};

const fr: typeof en = {
  metaTitle: "À propos",
  description:
    "Pourquoi Kora Energy existe : une électricité fiable et abordable pour les entreprises d'Afrique de l'Ouest, conçue à partir de la façon dont chaque site consomme. Un projet de portfolio fictif.",
  title: "Une électricité sur laquelle une entreprise peut compter",
  lead: "Kora Energy veut faire d'une énergie fiable et abordable une évidence pour les entreprises d'Afrique de l'Ouest, en commençant par la Côte d'Ivoire.",
  problemTitle: "Le problème, c'est la fiabilité autant que l'accès",
  problem: [
    "En Afrique subsaharienne, des centaines de millions de personnes vivent encore sans électricité. Mais pour beaucoup d'entreprises des villes de la région, le problème est autre : elles sont raccordées et ne peuvent pourtant pas compter sur l'alimentation. La Côte d'Ivoire possède l'un des réseaux les plus étendus d'Afrique de l'Ouest, et pourtant, en 2021, un déficit de production a entraîné des semaines de délestages programmés à Abidjan.",
    "Quand le réseau lâche, les entreprises se rabattent sur des groupes électrogènes au gazole : chers au kilowattheure, bruyants, polluants et dépendants de livraisons à l'heure. Quand il fonctionne, l'électricité reste l'une des rares charges qui augmente chaque année et ne se négocie pas.",
    "Pendant ce temps, le soleil se lève vers six heures et se couche vers six heures presque tous les jours de l'année, sur des millions de mètres carrés de toits plats qui ne font que chauffer les bâtiments en dessous.",
  ],
  caption: "Photographie d'illustration.",
  whatTitle: "Ce que Kora y change",
  what: [
    "Les panneaux solaires et les batteries sont désormais assez bon marché pour qu'une entreprise active en journée les rentabilise généralement en quelques années. Ce qui manque, c'est rarement le matériel. C'est la confiance qu'un système sera bien dimensionné, bien installé et toujours en marche dans dix ans.",
    "Kora est construite autour de ce manque : une estimation honnête avant toute visite, une étude qui mesure au lieu de deviner, des systèmes conçus pour le climat, et un suivi qui montre s'ils tiennent leurs promesses. Le but est la productivité : une clinique qui ne perd jamais sa chaîne du froid, une école dont la salle informatique fonctionne à chaque cours, une usine dont les coûts cessent de bouger.",
  ],
  principlesTitle: "Notre façon de travailler",
  principles: [
    {
      title: "Concevoir à partir de la consommation, pas du catalogue",
      text: "Un système ne vaut que par son adéquation aux heures où un site consomme. Nous modélisons cela d'abord, et dimensionnons tout le reste à partir de là.",
    },
    {
      title: "Montrer le raisonnement",
      text: "Chaque estimation liste ses hypothèses. Quand un chiffre est incertain, nous donnons une fourchette et disons ce qui le rendrait plus précis.",
    },
    {
      title: "Construire pour la chaleur, la poussière et l'humidité",
      text: "Le matériel est choisi et installé pour les conditions qu'il va connaître : fixations ventilées, accès pour le nettoyage, électronique protégée.",
    },
    {
      title: "Mesurer après notre départ",
      text: "Le suivi fait partie de chaque système, et nous rendons compte chaque année par rapport à ce que nous avions annoncé.",
    },
  ],
  concept: {
    title: "À propos de ce projet",
    badge: "Kora Energy n'est pas une vraie entreprise.",
    intro:
      "Ce site est un projet fictif, conçu pour montrer comment une vraie entreprise d'énergie en Afrique de l'Ouest pourrait se présenter, qualifier ses clients et gérer son pipeline commercial. Il n'y a ni historique, ni équipe, ni clientèle à présenter, et rien de tout cela n'a été inventé.",
    fictionalTitle: "Ce qui est fictif",
    fictional: [
      "L'entreprise, ses bureaux, ses numéros de téléphone et ses adresses e-mail.",
      "Les études de cas, qui sont des études de conception pour des sites types et non de vraies installations.",
      "Toute offre implicite de services ou de financement.",
    ],
    realTitle: "Ce qui est réel",
    real: [
      "Le modèle d'estimation : une simulation heure par heure fondée sur des hypothèses réalistes et arrondies de production, de tarifs et de prix en Côte d'Ivoire, toutes listées sur la page du simulateur.",
      "Le logiciel : des formulaires validés côté serveur, une API JSON, un pipeline de prospects, et un back-office où sont gérées les demandes de devis et les études de cas.",
    ],
    storedBefore:
      "Tout ce que vous envoyez via les formulaires est enregistré uniquement dans le back-office de démonstration. Voir la ",
    privacyLink: "politique de confidentialité",
    storedAfter: ".",
    creditsTitle: "Photographies et vidéo",
    credits:
      "Les photographies et la vidéo proviennent de banques d'images libres de droits et illustrent le matériel et les travaux d'installation en général. Aucune ne montre un projet Kora ; les études de cas sont illustrées uniquement par des plans tracés à partir de leurs propres chiffres.",
    newTab: " (nouvel onglet)",
  },
  cta: "Voyez ce que le modèle dit de votre propre site.",
  calculate: "Calculer vos économies",
};

const COPY: Record<Locale, typeof en> = { en, fr };

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  return pageMetadata({ title: t.metaTitle, description: t.description, path: "/about", locale });
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  const c = t.concept;

  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[{ name: t.metaTitle, path: "/about" }]}
        title={t.title}
        lead={t.lead}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <h2 className="type-h2">{t.problemTitle}</h2>
          <div className="prose-kora type-lead text-muted">
            {t.problem.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <PhotoFigure
          photo={photos.roofDusk}
          locale={locale}
          ratio="21/9"
          sizes="(min-width: 1360px) 1264px, 100vw"
          caption={t.caption}
          className="mt-14 md:mt-20"
        />
      </Section>

      <Section tone="ink">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <h2 className="type-h2">{t.whatTitle}</h2>
          <div className="prose-kora type-lead text-on-ink-muted">
            {t.what.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="plaster" labelledBy="principles-title">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <PhotoFigure
            photo={photos.technicianSite}
            locale={locale}
            ratio="4/5"
            focus="82% 40%"
            sizes="(min-width: 1024px) 40vw, 100vw"
            caption={t.caption}
            className="lg:sticky lg:top-[calc(var(--spacing-header)+24px)]"
          />
          <div>
            <h2 id="principles-title" className="type-h2 max-w-2xl">
              {t.principlesTitle}
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {t.principles.map((p) => (
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
              {c.title}
            </h2>
            <p className="bg-sun-soft w-fit rounded-[var(--radius-sm)] px-3 py-1.5 font-semibold">
              {c.badge}
            </p>
          </div>
          <div className="prose-kora">
            <p>{c.intro}</p>
            <h3>{c.fictionalTitle}</h3>
            <ul>
              {c.fictional.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>{c.realTitle}</h3>
            <ul>
              {c.real.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              {c.storedBefore}
              <Link href="/privacy">{c.privacyLink}</Link>
              {c.storedAfter}
            </p>
            <h3 id="credits">{c.creditsTitle}</h3>
            <p>{c.credits}</p>
            <ul>
              {allCredits(locale).map(({ what, credit }) => (
                <li key={credit.url}>
                  {what}{" "}
                  <a href={credit.url} rel="noopener noreferrer" target="_blank">
                    {credit.author}, {credit.source}
                    <span className="sr-only">{c.newTab}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <section className="bg-sun text-ink">
        <Container className="flex flex-col gap-6 py-14 md:flex-row md:items-center md:justify-between">
          <p className="type-h3 max-w-xl">{t.cta}</p>
          <ButtonLink href="/calculator" variant="secondary" size="lg">
            {t.calculate}
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
