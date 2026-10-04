import type { Locale } from "@/app/lib/i18n";

export type NavLink = { label: string; href: string };

type Nav = {
  primary: NavLink[];
  /** The mobile menu adds these around the primary links. */
  home: NavLink;
  questions: NavLink;
  footer: Array<{ title: string; links: NavLink[] }>;
};

/** Paths are language-free; the Link component adds the "/fr" prefix. */
const en: Nav = {
  primary: [
    { label: "Solutions", href: "/solutions" },
    { label: "Calculator", href: "/calculator" },
    { label: "Projects", href: "/projects" },
    { label: "Financing", href: "/financing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  home: { label: "Home", href: "/" },
  questions: { label: "Questions", href: "/faq" },
  footer: [
    {
      title: "Solutions",
      links: [
        { label: "Business solar", href: "/solutions/business" },
        { label: "Commercial solar", href: "/solutions/commercial" },
        { label: "Industrial solar", href: "/solutions/industrial" },
        { label: "Home solar", href: "/solutions/residential" },
        { label: "Backup power", href: "/solutions/backup" },
        { label: "Energy monitoring", href: "/solutions/monitoring" },
      ],
    },
    {
      title: "Plan your system",
      links: [
        { label: "Savings calculator", href: "/calculator" },
        { label: "Request a quote", href: "/quote" },
        { label: "Financing options", href: "/financing" },
        { label: "Questions and answers", href: "/faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Kora", href: "/about" },
        { label: "Projects", href: "/projects" },
        { label: "Contact", href: "/contact" },
        { label: "Privacy", href: "/privacy" },
      ],
    },
  ],
};

const fr: Nav = {
  primary: [
    { label: "Solutions", href: "/solutions" },
    { label: "Simulateur", href: "/calculator" },
    { label: "Projets", href: "/projects" },
    { label: "Financement", href: "/financing" },
    { label: "À propos", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  home: { label: "Accueil", href: "/" },
  questions: { label: "Questions", href: "/faq" },
  footer: [
    {
      title: "Solutions",
      links: [
        { label: "Solaire pour les entreprises", href: "/solutions/business" },
        { label: "Solaire tertiaire", href: "/solutions/commercial" },
        { label: "Solaire industriel", href: "/solutions/industrial" },
        { label: "Solaire résidentiel", href: "/solutions/residential" },
        { label: "Alimentation de secours", href: "/solutions/backup" },
        { label: "Suivi énergétique", href: "/solutions/monitoring" },
      ],
    },
    {
      title: "Préparer votre projet",
      links: [
        { label: "Simulateur d'économies", href: "/calculator" },
        { label: "Demander un devis", href: "/quote" },
        { label: "Options de financement", href: "/financing" },
        { label: "Questions et réponses", href: "/faq" },
      ],
    },
    {
      title: "Entreprise",
      links: [
        { label: "À propos de Kora", href: "/about" },
        { label: "Projets", href: "/projects" },
        { label: "Contact", href: "/contact" },
        { label: "Confidentialité", href: "/privacy" },
      ],
    },
  ],
};

const NAV: Record<Locale, Nav> = { en, fr };

export function navigation(locale: Locale): Nav {
  return NAV[locale];
}
