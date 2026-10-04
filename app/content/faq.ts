import type { Locale } from "@/app/lib/i18n";

export type FaqItem = { question: string; answer: string };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

/**
 * Written to answer what a business owner actually asks on the first call
 * not to restate marketing copy. The homepage shows the `featured` subset.
 */
export const faqGroups: FaqGroup[] = [
  {
    id: "basics",
    title: "Getting started",
    items: [
      {
        question: "How accurate is the online calculator?",
        answer:
          "It's a planning estimate, not a quote. It uses your bill, the typical daily pattern for your type of site and the sunshine where you are, and it shows its assumptions. Real figures depend on your roof, your equipment and your actual consumption  which is what the free site survey measures. In our experience a survey usually moves the estimate by less than 20 %.",
      },
      {
        question: "What happens after I request a quote?",
        answer:
          "An energy specialist contacts you within one working day to go through your needs. If solar makes sense for your site, we arrange a visit to measure the roof, check your electrical installation and, where possible, record your consumption. You then receive a written proposal with a fixed price, a production estimate and a payback calculation.",
      },
      {
        question: "Do I need to own the building?",
        answer:
          "No, but the owner needs to agree to the installation. Many of our commercial customers are tenants; in that case we involve the landlord early, and the system can be designed to be moved if the lease ends.",
      },
      {
        question: "What information should I have ready?",
        answer:
          "Your last few electricity bills are the most useful thing. If you run a generator, a rough idea of how many hours a week it runs helps too. A photo of your roof and your electrical panel is a bonus, not a requirement.",
      },
    ],
  },
  {
    id: "technical",
    title: "How the systems work",
    items: [
      {
        question: "Will solar work during the rainy season?",
        answer:
          "Yes, at reduced output. Panels produce from daylight, not only direct sun, so overcast days still generate  typically a third to a half of a clear day. Our estimates are based on a full year of weather, including the rainy months, so the annual figures already account for them.",
      },
      {
        question: "Does solar keep working during a power cut?",
        answer:
          "Only if the system has a battery or a hybrid inverter designed for backup. A simple grid-tied system shuts down during a cut, for the safety of people working on the lines. If outages matter to you, tell us  that is exactly what the backup design is for.",
      },
      {
        question: "Can I export surplus energy to the grid?",
        answer:
          "Côte d'Ivoire does not currently have a general scheme that pays businesses for exported solar energy, so we size systems for what you can use or store on site. That is also why our calculator stops recommending more panels once the extra energy would go unused.",
      },
      {
        question: "How long do the systems last?",
        answer:
          "Panels are typically warrantied to produce at least 80 % of their rated output after 25 years. Inverters usually last 10–15 years, and lithium iron phosphate batteries 10 years or more, depending on how deeply they are cycled. Our maintenance plans include replacement planning for both.",
      },
      {
        question: "How do the panels cope with dust and heat?",
        answer:
          "Heat reduces output slightly and dust  particularly during the harmattan  can cut it further. Designs include ventilation behind the panels and walkways for cleaning, and our monitoring flags when output drops enough that a clean would pay for itself.",
      },
    ],
  },
  {
    id: "money",
    title: "Cost and payment",
    items: [
      {
        question: "How much does a system cost?",
        answer:
          "It depends mostly on size and storage. As a rough guide, panel-only commercial systems cost around 450 000 – 560 000 FCFA per kWp installed, and batteries add about 260 000 FCFA per usable kWh. The calculator gives a range for your site, and the proposal after the survey gives a fixed price.",
      },
      {
        question: "Can I pay in instalments?",
        answer:
          "In this concept, Kora Energy describes several ways to pay  outright purchase, staged payments during the project, and instalment or energy-plan models arranged with financing partners. See the Financing page for how each works and who it suits. No financing is actually offered: Kora Energy is a fictional company.",
      },
      {
        question: "What maintenance does a system need?",
        answer:
          "Very little. Panels need cleaning a few times a year, more often in dusty areas, and the electrical installation should be inspected once a year. Monitoring shows when something is off, so problems are usually fixed before you would have noticed them.",
      },
    ],
  },
];

/** The same questions in French, in the same groups and order. */
const faqGroupsFr: FaqGroup[] = [
  {
    id: "basics",
    title: "Pour commencer",
    items: [
      {
        question: "Quelle est la précision du simulateur en ligne ?",
        answer:
          "C'est une estimation de préparation, pas un devis. Il utilise votre facture, le profil journalier type de votre activité et l'ensoleillement de votre ville, et il affiche ses hypothèses. Les chiffres réels dépendent de votre toiture, de vos équipements et de votre consommation réelle : c'est ce que mesure la visite technique gratuite. D'expérience, une visite modifie généralement l'estimation de moins de 20 %.",
      },
      {
        question: "Que se passe-t-il après ma demande de devis ?",
        answer:
          "Un conseiller en énergie vous contacte sous un jour ouvré pour faire le point sur vos besoins. Si le solaire a du sens pour votre site, nous organisons une visite pour mesurer la toiture, vérifier votre installation électrique et, si possible, enregistrer votre consommation. Vous recevez ensuite une proposition écrite avec un prix ferme, une estimation de production et un calcul de retour sur investissement.",
      },
      {
        question: "Dois-je être propriétaire du bâtiment ?",
        answer:
          "Non, mais le propriétaire doit accepter l'installation. Beaucoup de nos clients professionnels sont locataires ; dans ce cas, nous impliquons le bailleur dès le départ, et le système peut être conçu pour être déplacé à la fin du bail.",
      },
      {
        question: "Quelles informations dois-je préparer ?",
        answer:
          "Vos dernières factures d'électricité sont le plus utile. Si vous utilisez un groupe électrogène, une idée du nombre d'heures de fonctionnement par semaine aide aussi. Une photo de votre toit et de votre tableau électrique est un plus, pas une obligation.",
      },
    ],
  },
  {
    id: "technical",
    title: "Comment fonctionnent les systèmes",
    items: [
      {
        question: "Le solaire fonctionne-t-il pendant la saison des pluies ?",
        answer:
          "Oui, avec une production réduite. Les panneaux produisent à partir de la lumière du jour, pas seulement du soleil direct : un jour couvert produit encore, en général entre un tiers et la moitié d'un jour clair. Nos estimations reposent sur une année météo complète, saisons des pluies comprises, donc les chiffres annuels en tiennent déjà compte.",
      },
      {
        question: "Le solaire continue-t-il de fonctionner pendant une coupure ?",
        answer:
          "Seulement si le système comporte une batterie ou un onduleur hybride prévu pour le secours. Un simple système raccordé au réseau s'arrête pendant une coupure, pour la sécurité des personnes qui interviennent sur les lignes. Si les coupures comptent pour vous, dites-le-nous : c'est précisément le rôle de la conception de secours.",
      },
      {
        question: "Puis-je revendre mon surplus d'énergie au réseau ?",
        answer:
          "La Côte d'Ivoire n'a pas aujourd'hui de dispositif général qui rémunère les entreprises pour l'énergie solaire injectée ; nous dimensionnons donc les systèmes pour ce que vous pouvez consommer ou stocker sur place. C'est aussi pourquoi notre simulateur cesse de recommander des panneaux supplémentaires dès que l'énergie en plus ne serait pas utilisée.",
      },
      {
        question: "Combien de temps durent les systèmes ?",
        answer:
          "Les panneaux sont généralement garantis pour produire au moins 80 % de leur puissance nominale après 25 ans. Les onduleurs durent en général 10 à 15 ans, et les batteries lithium fer phosphate 10 ans ou plus, selon la profondeur de leurs cycles. Nos contrats de maintenance prévoient le remplacement des deux.",
      },
      {
        question: "Comment les panneaux supportent-ils la poussière et la chaleur ?",
        answer:
          "La chaleur réduit légèrement la production, et la poussière, surtout pendant l'harmattan, peut la réduire davantage. Les installations prévoient une ventilation sous les panneaux et des allées pour le nettoyage, et notre suivi signale quand la production baisse assez pour qu'un nettoyage soit rentable.",
      },
    ],
  },
  {
    id: "money",
    title: "Coût et paiement",
    items: [
      {
        question: "Combien coûte un système ?",
        answer:
          "Cela dépend surtout de la taille et du stockage. À titre indicatif, un système professionnel sans batterie coûte environ 450 000 à 560 000 FCFA par kWc installé, et les batteries ajoutent environ 260 000 FCFA par kWh utile. Le simulateur donne une fourchette pour votre site, et la proposition qui suit la visite donne un prix ferme.",
      },
      {
        question: "Puis-je payer en plusieurs fois ?",
        answer:
          "Dans ce concept, Kora Energy présente plusieurs façons de payer : achat comptant, paiements échelonnés pendant le projet, et formules de crédit ou de contrat d'énergie montées avec des partenaires financiers. La page Financement explique le fonctionnement de chacune et à qui elle convient. Aucun financement n'est réellement proposé : Kora Energy est une entreprise fictive.",
      },
      {
        question: "Quel entretien un système demande-t-il ?",
        answer:
          "Très peu. Les panneaux doivent être nettoyés quelques fois par an, plus souvent dans les zones poussiéreuses, et l'installation électrique doit être contrôlée une fois par an. Le suivi indique quand quelque chose ne va pas, si bien que les problèmes sont généralement réglés avant que vous ne les remarquiez.",
      },
    ],
  },
];

const FAQ: Record<Locale, FaqGroup[]> = { en: faqGroups, fr: faqGroupsFr };

/** The questions in `locale`, with the homepage's featured subset picked the same way in each. */
export function faqContent(locale: Locale): { groups: FaqGroup[]; featured: FaqItem[] } {
  const groups = FAQ[locale];
  return {
    groups,
    featured: [
      groups[0]!.items[0]!,
      groups[1]!.items[1]!,
      groups[1]!.items[0]!,
      groups[2]!.items[0]!,
    ],
  };
}
