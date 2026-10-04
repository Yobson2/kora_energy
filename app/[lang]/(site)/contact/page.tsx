import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { ContactForm } from "@/app/components/contact/contact-form";
import { DistrictMap } from "@/app/components/visuals/district-map";
import { pageMetadata } from "@/app/lib/metadata";
import { pageLocale } from "@/app/lib/route-locale";
import type { Locale } from "@/app/lib/i18n";
import { siteConfig, siteCopy } from "@/app/lib/site";

const COPY: Record<
  Locale,
  {
    description: string;
    title: string;
    lead: string;
    quote: string;
    send: string;
    office: string;
    demo: string;
    location: string;
    district: (district: string) => string;
    phone: string;
    email: string;
    hours: string;
  }
> = {
  en: {
    description:
      "Talk to a Kora Energy specialist about a new installation, a project in progress or an existing system.",
    title: "Talk to an energy specialist",
    lead: "For a new installation, the quote request gets you a proposal fastest. For anything else, send us a message.",
    quote: "Request a quote instead",
    send: "Send a message",
    office: "Office",
    demo: "Demonstration details: these don't reach anyone.",
    location: "Location",
    district: (d) => `${d} district`,
    phone: "Phone",
    email: "Email",
    hours: "Opening hours",
  },
  fr: {
    description:
      "Parlez à un conseiller Kora Energy d'une nouvelle installation, d'un projet en cours ou d'un système existant.",
    title: "Parlez à un conseiller en énergie",
    lead: "Pour une nouvelle installation, la demande de devis est le chemin le plus rapide vers une proposition. Pour tout le reste, envoyez-nous un message.",
    quote: "Demander plutôt un devis",
    send: "Envoyer un message",
    office: "Bureaux",
    demo: "Coordonnées de démonstration : elles ne joignent personne.",
    location: "Adresse",
    district: (d) => `Quartier du ${d}`,
    phone: "Téléphone",
    email: "E-mail",
    hours: "Horaires d'ouverture",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const locale = await pageLocale(params);
  return pageMetadata({
    title: "Contact",
    description: COPY[locale].description,
    path: "/contact",
    locale,
  });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const locale = await pageLocale(params);
  const t = COPY[locale];
  const site = siteCopy(locale);

  return (
    <>
      <PageHeader
        locale={locale}
        crumbs={[{ name: "Contact", path: "/contact" }]}
        title={t.title}
        lead={t.lead}
      >
        <div>
          <ButtonLink href="/quote" variant="primary">
            {t.quote}
          </ButtonLink>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <h2 className="type-h2">{t.send}</h2>
            <ContactForm />
          </div>

          <aside aria-labelledby="details-title" className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 id="details-title" className="type-h2">
                {t.office}
              </h2>
              <p className="type-small bg-sun-soft w-fit rounded-[var(--radius-sm)] px-3 py-1.5">
                {t.demo}
              </p>
            </div>
            <dl className="flex flex-col gap-5">
              <div className="flex gap-3">
                <MapPin className="text-muted mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <dt className="font-semibold">{t.location}</dt>
                  <dd className="text-muted">
                    {t.district(siteConfig.office.district)}, {siteConfig.office.city},{" "}
                    {siteConfig.office.country}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="text-muted mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <dt className="font-semibold">{t.phone}</dt>
                  <dd className="text-muted tabular">{siteConfig.phone}</dd>
                  <dd className="text-muted tabular">WhatsApp {siteConfig.whatsapp}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="text-muted mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <dt className="font-semibold">{t.email}</dt>
                  <dd className="text-muted">{siteConfig.email}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="text-muted mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <dt className="font-semibold">{t.hours}</dt>
                  {site.hours.map((h) => (
                    <dd key={h.days} className="text-muted">
                      {h.days}
                      {locale === "fr" ? " : " : ": "}
                      <span className="tabular">{h.time}</span>
                    </dd>
                  ))}
                  <dd className="type-small text-muted mt-1">{site.timezoneNote}</dd>
                </div>
              </div>
            </dl>
            <DistrictMap locale={locale} />
          </aside>
        </div>
      </Section>
    </>
  );
}
