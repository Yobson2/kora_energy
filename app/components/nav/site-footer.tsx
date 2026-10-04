import { Link } from "@/app/components/primitives/link";
import { Container } from "@/app/components/primitives/container";
import { Logo } from "@/app/components/nav/logo";
import { navigation } from "@/app/content/nav";
import type { Locale } from "@/app/lib/i18n";
import { siteConfig } from "@/app/lib/site";

const COPY: Record<Locale, { about: string; demo: string; copyright: string; prices: string }> = {
  en: {
    about:
      "Solar and battery systems for businesses, institutions and homes in Côte d'Ivoire, designed around how each site really uses energy.",
    demo: "(demo details)",
    copyright:
      "© 2024 Kora Energy, a fictional company. Portfolio concept; not a real business, offer or service.",
    prices: "Prices in FCFA (XOF). All estimates are indicative.",
  },
  fr: {
    about:
      "Systèmes solaires et batteries pour les entreprises, les institutions et les logements de Côte d'Ivoire, conçus selon la façon dont chaque site consomme réellement l'énergie.",
    demo: "(coordonnées fictives)",
    copyright:
      "© 2024 Kora Energy, une entreprise fictive. Projet de portfolio ; ni entreprise, ni offre, ni service réels.",
    prices: "Prix en FCFA (XOF). Toutes les estimations sont indicatives.",
  },
};

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  return (
    <footer className="bg-ink text-paper">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.2fr_2fr] md:py-20">
        <div className="flex max-w-sm flex-col gap-5">
          <Logo />
          <p className="text-on-ink-muted">{t.about}</p>
          <address className="type-small text-on-ink-muted flex flex-col gap-1 not-italic">
            <span>
              {siteConfig.office.district}, {siteConfig.office.city} {t.demo}
            </span>
            <a
              href={`mailto:${siteConfig.email}`}
              className="hover:text-paper underline-offset-2 hover:underline"
            >
              {siteConfig.email}
            </a>
            <span className="tabular">{siteConfig.phone}</span>
          </address>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {navigation(locale).footer.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="type-label text-paper mb-4">{group.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-on-ink-muted hover:text-paper underline-offset-2 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Container>

      <div className="border-ink-line border-t">
        <Container className="type-small text-on-ink-muted flex flex-col gap-2 py-6 md:flex-row md:justify-between">
          <p>{t.copyright}</p>
          <p>{t.prices}</p>
        </Container>
      </div>
    </footer>
  );
}
