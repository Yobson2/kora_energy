export type NavLink = { label: string; href: string };

export const primaryNav: NavLink[] = [
  { label: "Solutions", href: "/solutions" },
  { label: "Calculator", href: "/calculator" },
  { label: "Projects", href: "/projects" },
  { label: "Financing", href: "/financing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: Array<{ title: string; links: NavLink[] }> = [
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
];
