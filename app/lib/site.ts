/**
 * Single source of truth for business identity.
 *
 * Kora Energy is FICTIONAL — a portfolio concept. Every contact detail below
 * is deliberately unusable: `.example` is a reserved domain that can never
 * receive mail, the phone number is a placeholder pattern, and the office is
 * a district, not an address. The concept banner and the footer say so on
 * every page.
 */
export const siteConfig = {
  name: "Kora Energy",
  legalName: "Kora Energy (concept project)",
  tagline: "Solar power for West African businesses",
  description:
    "Kora Energy designs and installs solar and battery systems for businesses, schools, clinics and homes in Côte d'Ivoire. Estimate your savings in two minutes.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kora-energy.example",
  themeColor: "#0f2a2e",

  email: "hello@kora-energy.example",
  phone: "+225 27 00 00 00 00",
  phoneHref: "tel:+2252700000000",
  whatsapp: "+225 07 00 00 00 00",
  office: {
    district: "Plateau",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    countryCode: "CI",
  },
  hours: [
    { days: "Monday to Friday", time: "08:00 – 18:00" },
    { days: "Saturday", time: "09:00 – 13:00" },
  ],
  /** Côte d'Ivoire is on GMT all year — no daylight saving. */
  timezoneNote: "All times GMT (Abidjan time).",
} as const;
