import type { Locale } from "@/app/lib/i18n";
import {
  INDEPENDENCE_RULES,
  LOCATION,
  SEGMENT_LABEL,
  type Independence,
  type Location,
  type Segment,
} from "@/app/lib/solar/assumptions";
import {
  CONTACT_TOPIC_LABEL,
  TIMELINE_LABEL,
  type ContactTopic,
  type Timeline,
} from "@/app/lib/domain";

/**
 * The business vocabulary in each language of the public site. English is
 * the original, defined next to the data it names (assumptions.ts, domain.ts)
 * and used as-is by the back office and the CSV export; French translates it.
 * Typed as complete records, so a new segment or city without a French name
 * fails the type check.
 */

type Labels = {
  segment: Record<Segment, string>;
  /**
   * With the indefinite article, for sentences: "a school", "une école".
   * French needs it because the gender changes with the noun.
   */
  segmentWithArticle: Record<Segment, string>;
  location: Record<Location, string>;
  independence: Record<Independence, { label: string; summary: string }>;
  timeline: Record<Timeline, string>;
  contactTopic: Record<ContactTopic, string>;
};

const en: Labels = {
  segment: SEGMENT_LABEL,
  segmentWithArticle: {
    office: "an office",
    hotel: "a hotel or guesthouse",
    restaurant: "a restaurant or café",
    school: "a school",
    clinic: "a clinic or pharmacy",
    retail: "a shop or supermarket",
    industrial: "a workshop or factory",
    household: "a home",
  },
  location: Object.fromEntries(Object.entries(LOCATION).map(([k, v]) => [k, v.label])) as Record<
    Location,
    string
  >,
  independence: INDEPENDENCE_RULES,
  timeline: TIMELINE_LABEL,
  contactTopic: CONTACT_TOPIC_LABEL,
};

const fr: Labels = {
  segment: {
    office: "Bureaux",
    hotel: "Hôtel ou maison d'hôtes",
    restaurant: "Restaurant ou café",
    school: "École",
    clinic: "Clinique ou pharmacie",
    retail: "Commerce ou supermarché",
    industrial: "Atelier ou usine",
    household: "Logement",
  },
  segmentWithArticle: {
    office: "des bureaux",
    hotel: "un hôtel ou une maison d'hôtes",
    restaurant: "un restaurant ou un café",
    school: "une école",
    clinic: "une clinique ou une pharmacie",
    retail: "un commerce ou un supermarché",
    industrial: "un atelier ou une usine",
    household: "un logement",
  },
  location: {
    abidjan: "Abidjan",
    yamoussoukro: "Yamoussoukro",
    bouake: "Bouaké",
    "san-pedro": "San-Pédro",
    korhogo: "Korhogo",
    daloa: "Daloa",
    other: "Ailleurs en Afrique de l'Ouest",
  },
  independence: {
    savings: {
      label: "Réduire ma facture",
      summary:
        "Panneaux seuls. Dimensionnés sur la consommation de jour, le retour le plus rapide.",
    },
    balanced: {
      label: "Économies et secours",
      summary: "Panneaux et batterie qui couvre la soirée et les coupures courtes.",
    },
    maximum: {
      label: "Autonomie maximale",
      summary: "Une batterie plus grande qui fait tourner le site pendant la plupart des coupures.",
    },
  },
  timeline: {
    asap: "Dès que possible",
    "3-months": "D'ici 3 mois",
    "6-months": "D'ici 6 mois",
    exploring: "Je me renseigne",
  },
  contactTopic: {
    sales: "Une nouvelle installation",
    project: "Une installation en cours",
    support: "L'assistance pour un système existant",
    partnership: "Partenariats et fournisseurs",
    other: "Autre chose",
  },
};

const LABELS: Record<Locale, Labels> = { en, fr };

export function labels(locale: Locale): Labels {
  return LABELS[locale];
}
