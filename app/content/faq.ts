export type FaqItem = { question: string; answer: string };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

/**
 * Written to answer what a business owner actually asks on the first call —
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
          "It's a planning estimate, not a quote. It uses your bill, the typical daily pattern for your type of site and the sunshine where you are, and it shows its assumptions. Real figures depend on your roof, your equipment and your actual consumption — which is what the free site survey measures. In our experience a survey usually moves the estimate by less than 20 %.",
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
          "Yes, at reduced output. Panels produce from daylight, not only direct sun, so overcast days still generate — typically a third to a half of a clear day. Our estimates are based on a full year of weather, including the rainy months, so the annual figures already account for them.",
      },
      {
        question: "Does solar keep working during a power cut?",
        answer:
          "Only if the system has a battery or a hybrid inverter designed for backup. A simple grid-tied system shuts down during a cut, for the safety of people working on the lines. If outages matter to you, tell us — that is exactly what the backup design is for.",
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
          "Heat reduces output slightly and dust — particularly during the harmattan — can cut it further. Designs include ventilation behind the panels and walkways for cleaning, and our monitoring flags when output drops enough that a clean would pay for itself.",
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
          "In this concept, Kora Energy describes several ways to pay — outright purchase, staged payments during the project, and instalment or energy-plan models arranged with financing partners. See the Financing page for how each works and who it suits. No financing is actually offered: Kora Energy is a fictional company.",
      },
      {
        question: "What maintenance does a system need?",
        answer:
          "Very little. Panels need cleaning a few times a year, more often in dusty areas, and the electrical installation should be inspected once a year. Monitoring shows when something is off, so problems are usually fixed before you would have noticed them.",
      },
    ],
  },
];

export const featuredFaq: FaqItem[] = [
  faqGroups[0]!.items[0]!,
  faqGroups[1]!.items[1]!,
  faqGroups[1]!.items[0]!,
  faqGroups[2]!.items[0]!,
];
