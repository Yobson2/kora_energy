import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/app/components/primitives/page-header";
import { Section } from "@/app/components/primitives/section";
import { ButtonLink } from "@/app/components/primitives/button";
import { ContactForm } from "@/app/components/contact/contact-form";
import { DistrictMap } from "@/app/components/visuals/district-map";
import { pageMetadata } from "@/app/lib/metadata";
import { siteConfig } from "@/app/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Talk to a Kora Energy specialist about a new installation, a project in progress or an existing system.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Contact", path: "/contact" }]}
        title="Talk to an energy specialist"
        lead="For a new installation, the quote request gets you a proposal fastest. For anything else, send us a message."
      >
        <div>
          <ButtonLink href="/quote" variant="primary">
            Request a quote instead
          </ButtonLink>
        </div>
      </PageHeader>

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <h2 className="type-h2">Send a message</h2>
            <ContactForm />
          </div>

          <aside aria-labelledby="details-title" className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 id="details-title" className="type-h2">
                Office
              </h2>
              <p className="type-small bg-sun-soft w-fit rounded-[var(--radius-sm)] px-3 py-1.5">
                Demonstration details: these don&apos;t reach anyone.
              </p>
            </div>
            <dl className="flex flex-col gap-5">
              <div className="flex gap-3">
                <MapPin className="text-muted mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <dt className="font-semibold">Location</dt>
                  <dd className="text-muted">
                    {siteConfig.office.district} district, {siteConfig.office.city},{" "}
                    {siteConfig.office.country}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="text-muted mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <dt className="font-semibold">Phone</dt>
                  <dd className="text-muted tabular">{siteConfig.phone}</dd>
                  <dd className="text-muted tabular">WhatsApp {siteConfig.whatsapp}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="text-muted mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <dt className="font-semibold">Email</dt>
                  <dd className="text-muted">{siteConfig.email}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="text-muted mt-0.5 size-5 shrink-0" aria-hidden />
                <div>
                  <dt className="font-semibold">Opening hours</dt>
                  {siteConfig.hours.map((h) => (
                    <dd key={h.days} className="text-muted">
                      {h.days}: <span className="tabular">{h.time}</span>
                    </dd>
                  ))}
                  <dd className="type-small text-muted mt-1">{siteConfig.timezoneNote}</dd>
                </div>
              </div>
            </dl>
            <DistrictMap />
          </aside>
        </div>
      </Section>
    </>
  );
}
