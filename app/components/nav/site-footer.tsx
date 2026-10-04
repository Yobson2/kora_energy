import Link from "next/link";
import { Container } from "@/app/components/primitives/container";
import { Logo } from "@/app/components/nav/logo";
import { footerNav } from "@/app/content/nav";
import { siteConfig } from "@/app/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.2fr_2fr] md:py-20">
        <div className="flex max-w-sm flex-col gap-5">
          <Logo />
          <p className="text-on-ink-muted">
            Solar and battery systems for businesses, institutions and homes in Côte d&apos;Ivoire,
            designed around how each site really uses energy.
          </p>
          <address className="type-small text-on-ink-muted flex flex-col gap-1 not-italic">
            <span>
              {siteConfig.office.district}, {siteConfig.office.city} (demo details)
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
          {footerNav.map((group) => (
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
          <p>
            © 2026 Kora Energy — a fictional company. Portfolio concept; not a real business, offer
            or service.
          </p>
          <p>Prices in FCFA (XOF). All estimates are indicative.</p>
        </Container>
      </div>
    </footer>
  );
}
