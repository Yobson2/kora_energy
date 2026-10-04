import "server-only";
import type {
  Lead,
  LeadSource,
  LeadStatus,
  Project,
  ProjectCopy,
  SolutionSlug,
  Timeline,
} from "@/app/lib/domain";
import { estimate } from "@/app/lib/solar/estimate";
import type { Independence, Location, Segment } from "@/app/lib/solar/assumptions";
import { newId, newReference } from "@/app/server/ids";

/**
 * Initial data for a fresh store.
 *
 * Projects are the CONCEPT case studies shown on the public site. Leads are
 * demonstration records so the back office has something to work with; every
 * one is flagged `demo: true` and uses reserved example domains and an obviously
 * fake phone pattern, so none can be mistaken for a real person's details.
 */

export function seedProjects(): Project[] {
  const updatedAt = new Date().toISOString();
  const base = { published: true, updatedAt } as const;

  const projects: Project[] = [
    {
      ...base,
      id: newId(),
      slug: "business-hotel-cocody",
      title: "Keeping a business hotel cool through the afternoon peak",
      client: "Business hotel, 84 rooms",
      segment: "hotel",
      location: "abidjan",
      area: "Cocody, Abidjan",
      year: 2024,
      systemKwp: 160,
      batteryKwh: 280,
      annualProductionKwh: 208_000,
      solarShare: 0.46,
      co2TonnesPerYear: 89,
      featured: true,
      summary:
        "A rooftop array and battery that carry the hotel's air conditioning through the hottest hours and keep guest floors running during grid cuts.",
      challenge:
        "Air conditioning is roughly two thirds of the hotel's load and peaks between 13:00 and 17:00, exactly when tariffs bite. Short outages several times a month forced the diesel generator on, and guests noticed every switchover.",
      approach:
        "We sized the array to the daytime cooling load rather than the whole bill, then added storage dimensioned for the evening check-in peak and two hours of critical backup. A transfer switch keeps lifts, reception and guest floors on the battery while the kitchen and laundry wait for the grid.",
      results: [
        { label: "Of the annual load met by solar", value: "46 %" },
        { label: "Generator run-time avoided", value: "≈ 70 %" },
        { label: "Switchover seen by guests", value: "None" },
      ],
      roof: { width: 42, depth: 28 },
    },
    {
      ...base,
      id: newId(),
      slug: "secondary-school-yamoussoukro",
      title: "A school day that runs entirely on sunlight",
      client: "Secondary school, 1 200 pupils",
      segment: "school",
      location: "yamoussoukro",
      area: "Yamoussoukro",
      year: 2024,
      systemKwp: 60,
      batteryKwh: 60,
      annualProductionKwh: 84_000,
      solarShare: 0.78,
      co2TonnesPerYear: 30,
      featured: true,
      summary:
        "Two classroom blocks fitted with panels and a modest battery, sized so lessons, the computer lab and the borehole pump never wait for the grid.",
      challenge:
        "The school's load sits almost entirely between 07:00 and 16:00  an ideal match for solar  but the computer lab lost sessions to voltage drops, and the water pump stopped during every outage.",
      approach:
        "Panels on both blocks feed a single hybrid inverter. A 60 kWh battery is reserved for the lab and the pump rather than the whole site, which kept it small and the budget within one fiscal year.",
      results: [
        { label: "Of the annual load met by solar", value: "78 %" },
        { label: "Lab sessions lost to outages", value: "0 per term" },
        { label: "Estimated payback", value: "5–6 years" },
      ],
      roof: { width: 36, depth: 12 },
    },
    {
      ...base,
      id: newId(),
      slug: "logistics-warehouse-vridi",
      title: "A warehouse roof turned into the site's largest asset",
      client: "Logistics warehouse, port zone",
      segment: "industrial",
      location: "abidjan",
      area: "Vridi, Abidjan",
      year: 2025,
      systemKwp: 420,
      batteryKwh: 0,
      annualProductionKwh: 546_000,
      solarShare: 0.31,
      co2TonnesPerYear: 240,
      featured: true,
      summary:
        "A 420 kWp array across 3 000 m² of steel roof, with no battery at all, built for the fastest possible payback on a two-shift operation.",
      challenge:
        "Cold rooms, forklifts charging and lighting for two shifts made electricity the warehouse's second-largest cost after labour. The operator wanted savings, not backup  the site already has a grid connection it trusts.",
      approach:
        "With no storage to pay for, the design question was only how much array the daytime load could absorb. We stopped at the point where more panels would mostly feed energy back to nobody, and routed forklift charging to the midday hours.",
      results: [
        { label: "Of the annual load met by solar", value: "31 %" },
        { label: "Self-consumption of solar output", value: "96 %" },
        { label: "Estimated payback", value: "3–4 years" },
      ],
      roof: { width: 80, depth: 40 },
    },
    {
      ...base,
      id: newId(),
      slug: "supermarket-yopougon",
      title: "Refrigeration that pays for its own electricity",
      client: "Neighbourhood supermarket",
      segment: "retail",
      location: "abidjan",
      area: "Yopougon, Abidjan",
      year: 2025,
      systemKwp: 95,
      batteryKwh: 0,
      annualProductionKwh: 123_500,
      solarShare: 0.38,
      co2TonnesPerYear: 53,
      featured: false,
      summary:
        "Panels sized to the cold-chain and lighting load of a 12-hour trading day, with live monitoring that flags a failing compressor before stock is lost.",
      challenge:
        "Refrigeration runs around the clock, but the store's peak is the trading day. The owner also had no way to see consumption until the monthly bill arrived.",
      approach:
        "A battery-free array covers the trading-day load, and sub-metering on each refrigeration circuit feeds the monitoring dashboard, where an unusual draw raises an alert.",
      results: [
        { label: "Of the annual load met by solar", value: "38 %" },
        { label: "Circuits monitored", value: "14" },
        { label: "Estimated payback", value: "3–5 years" },
      ],
      roof: { width: 32, depth: 22 },
    },
    {
      ...base,
      id: newId(),
      slug: "rural-clinic-korhogo",
      title: "A clinic that no longer rations its generator",
      client: "Rural health clinic",
      segment: "clinic",
      location: "korhogo",
      area: "Near Korhogo",
      year: 2024,
      systemKwp: 24,
      batteryKwh: 60,
      annualProductionKwh: 37_200,
      solarShare: 0.82,
      co2TonnesPerYear: 14,
      featured: false,
      summary:
        "A compact system that keeps vaccine refrigeration, lighting and the delivery room powered through the night in one of the sunniest parts of the country.",
      challenge:
        "On a weak rural feeder the clinic lost power most evenings, and diesel deliveries were irregular. Staff rationed generator hours, which meant deliveries by torchlight.",
      approach:
        "Korhogo's strong irradiance lets a small array do a lot of work. The battery is sized for the night, with the vaccine fridge on a protected circuit that is the last to be shed.",
      results: [
        { label: "Of the annual load met by solar", value: "82 %" },
        { label: "Nights on generator", value: "Rare" },
        { label: "Vaccine fridge downtime", value: "None" },
      ],
      roof: { width: 14, depth: 12 },
    },
    {
      ...base,
      id: newId(),
      slug: "family-home-riviera",
      title: "Quiet evenings without the generator",
      client: "Family home",
      segment: "household",
      location: "abidjan",
      area: "Riviera, Abidjan",
      year: 2024,
      systemKwp: 8,
      batteryKwh: 15,
      annualProductionKwh: 10_400,
      solarShare: 0.62,
      co2TonnesPerYear: 4,
      featured: false,
      summary:
        "A small array and battery that keep fans, lights, the fridge and the Wi-Fi on through evening outages, without the noise of a petrol generator.",
      challenge:
        "Evening outages meant starting a small generator in a dense residential street. The family's real priority was continuity, with savings a welcome extra.",
      approach:
        "Essential circuits were separated onto a backup panel so the battery is never drained by the air conditioner. The array is sized to recharge it fully on an ordinary day.",
      results: [
        { label: "Of the annual load met by solar", value: "62 %" },
        { label: "Backup for essentials", value: "≈ 10 hours" },
        { label: "Generator", value: "Sold" },
      ],
      roof: { width: 11, depth: 8 },
    },
  ];
  return projects.map((p) => {
    const fr = PROJECTS_FR[p.slug];
    return fr ? { ...p, translations: { fr } } : p;
  });
}

/**
 * French text for the seeded case studies. Figures stay on the project; only
 * words are translated. A study created in the back office has none, and its
 * French page shows the English text (marked lang="en").
 */
const PROJECTS_FR: Record<string, ProjectCopy> = {
  "business-hotel-cocody": {
    title: "Garder un hôtel d'affaires au frais pendant le pic de l'après-midi",
    client: "Hôtel d'affaires, 84 chambres",
    area: "Cocody, Abidjan",
    summary:
      "Une centrale en toiture et une batterie qui assurent la climatisation de l'hôtel aux heures les plus chaudes et maintiennent les étages clients pendant les coupures du réseau.",
    challenge:
      "La climatisation représente environ les deux tiers de la consommation de l'hôtel et culmine entre 13:00 et 17:00, précisément quand les tarifs pèsent le plus. De courtes coupures plusieurs fois par mois démarraient le groupe électrogène, et les clients remarquaient chaque basculement.",
    approach:
      "Nous avons dimensionné la centrale sur la charge de climatisation de jour plutôt que sur toute la facture, puis ajouté un stockage calibré pour le pic des arrivées du soir et deux heures de secours critique. Un inverseur de source garde les ascenseurs, la réception et les étages clients sur batterie, tandis que la cuisine et la blanchisserie attendent le retour du réseau.",
    results: [
      { label: "De la consommation annuelle couverte par le solaire", value: "46 %" },
      { label: "Heures de groupe électrogène évitées", value: "≈ 70 %" },
      { label: "Basculements perçus par les clients", value: "Aucun" },
    ],
  },
  "secondary-school-yamoussoukro": {
    title: "Une journée de cours qui tourne entièrement au soleil",
    client: "Lycée, 1 200 élèves",
    area: "Yamoussoukro",
    summary:
      "Deux bâtiments de classes équipés de panneaux et d'une batterie modeste, dimensionnés pour que les cours, la salle informatique et la pompe du forage n'attendent jamais le réseau.",
    challenge:
      "La consommation de l'établissement se concentre presque entièrement entre 07:00 et 16:00, une correspondance idéale avec le solaire. Mais la salle informatique perdait des séances à cause des chutes de tension, et la pompe à eau s'arrêtait à chaque coupure.",
    approach:
      "Les panneaux des deux bâtiments alimentent un seul onduleur hybride. Une batterie de 60 kWh est réservée à la salle informatique et à la pompe plutôt qu'à tout le site, ce qui l'a gardée petite et a maintenu le budget sur un seul exercice.",
    results: [
      { label: "De la consommation annuelle couverte par le solaire", value: "78 %" },
      { label: "Séances informatiques perdues aux coupures", value: "0 par trimestre" },
      { label: "Retour sur investissement estimé", value: "5–6 ans" },
    ],
  },
  "logistics-warehouse-vridi": {
    title: "Un toit d'entrepôt devenu le premier actif du site",
    client: "Entrepôt logistique, zone portuaire",
    area: "Vridi, Abidjan",
    summary:
      "Une centrale de 420 kWc sur 3 000 m² de toiture métallique, sans aucune batterie, conçue pour le retour sur investissement le plus rapide possible sur une activité en deux équipes.",
    challenge:
      "Les chambres froides, la recharge des chariots élévateurs et l'éclairage de deux équipes faisaient de l'électricité le deuxième poste de dépenses après la main-d'œuvre. L'exploitant voulait des économies, pas du secours : le site dispose déjà d'un raccordement au réseau fiable.",
    approach:
      "Sans stockage à financer, la seule question était la quantité de panneaux que la consommation de jour pouvait absorber. Nous nous sommes arrêtés là où des panneaux supplémentaires auraient surtout produit une énergie que personne n'utilise, et avons déplacé la recharge des chariots vers la mi-journée.",
    results: [
      { label: "De la consommation annuelle couverte par le solaire", value: "31 %" },
      { label: "Autoconsommation de la production solaire", value: "96 %" },
      { label: "Retour sur investissement estimé", value: "3–4 ans" },
    ],
  },
  "supermarket-yopougon": {
    title: "Une réfrigération qui paie sa propre électricité",
    client: "Supermarché de quartier",
    area: "Yopougon, Abidjan",
    summary:
      "Des panneaux dimensionnés sur la chaîne du froid et l'éclairage d'une journée d'ouverture de 12 heures, avec un suivi en direct qui signale un compresseur défaillant avant toute perte de marchandise.",
    challenge:
      "La réfrigération tourne jour et nuit, mais le pic du magasin correspond aux heures d'ouverture. Le propriétaire n'avait en outre aucun moyen de voir sa consommation avant l'arrivée de la facture mensuelle.",
    approach:
      "Une centrale sans batterie couvre la consommation des heures d'ouverture, et un sous-comptage sur chaque circuit de froid alimente le tableau de bord de suivi, où une consommation inhabituelle déclenche une alerte.",
    results: [
      { label: "De la consommation annuelle couverte par le solaire", value: "38 %" },
      { label: "Circuits suivis", value: "14" },
      { label: "Retour sur investissement estimé", value: "3–5 ans" },
    ],
  },
  "rural-clinic-korhogo": {
    title: "Une clinique qui ne rationne plus son groupe électrogène",
    client: "Centre de santé rural",
    area: "Près de Korhogo",
    summary:
      "Un système compact qui alimente toute la nuit la réfrigération des vaccins, l'éclairage et la salle d'accouchement, dans l'une des régions les plus ensoleillées du pays.",
    challenge:
      "Sur un départ rural fragile, la clinique perdait le courant presque tous les soirs, et les livraisons de gazole étaient irrégulières. Le personnel rationnait les heures de groupe, ce qui voulait dire des accouchements à la lampe torche.",
    approach:
      "Le fort ensoleillement de Korhogo permet à une petite centrale de beaucoup produire. La batterie est dimensionnée pour la nuit, et le réfrigérateur à vaccins est sur un circuit protégé, le dernier à être délesté.",
    results: [
      { label: "De la consommation annuelle couverte par le solaire", value: "82 %" },
      { label: "Nuits sur groupe électrogène", value: "Rares" },
      { label: "Arrêts du réfrigérateur à vaccins", value: "Aucun" },
    ],
  },
  "family-home-riviera": {
    title: "Des soirées calmes sans groupe électrogène",
    client: "Maison familiale",
    area: "Riviera, Abidjan",
    summary:
      "Une petite centrale et une batterie qui gardent ventilateurs, éclairage, réfrigérateur et Wi-Fi allumés pendant les coupures du soir, sans le bruit d'un groupe à essence.",
    challenge:
      "Les coupures du soir obligeaient à démarrer un petit groupe dans une rue résidentielle dense. La vraie priorité de la famille était la continuité, les économies venant en plus.",
    approach:
      "Les circuits essentiels ont été regroupés sur un tableau de secours pour que la climatisation ne vide jamais la batterie. La centrale est dimensionnée pour la recharger entièrement lors d'une journée ordinaire.",
    results: [
      { label: "De la consommation annuelle couverte par le solaire", value: "62 %" },
      { label: "Autonomie des circuits essentiels", value: "≈ 10 heures" },
      { label: "Groupe électrogène", value: "Vendu" },
    ],
  },
};

type LeadSeed = {
  name: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  segment: Segment;
  location: Location;
  solution: SolutionSlug;
  timeline: Timeline;
  bill: number;
  generator?: number;
  independence: Independence;
  daysAgo: number;
  message?: string;
  notes?: string[];
};

const DEMO_LEADS: LeadSeed[] = [
  {
    name: "Aya Kouassi",
    company: "Hôtel Lagune Bleue (demo)",
    source: "quote",
    status: "new",
    segment: "hotel",
    location: "abidjan",
    solution: "commercial",
    timeline: "3-months",
    bill: 4_800_000,
    generator: 12,
    independence: "balanced",
    daysAgo: 0.1,
    message: "We have 60 rooms and lose power two or three times a week in the evening.",
  },
  {
    name: "Ibrahim Coulibaly",
    company: "Coulibaly Logistique (demo)",
    source: "calculator",
    status: "new",
    segment: "industrial",
    location: "abidjan",
    solution: "industrial",
    timeline: "6-months",
    bill: 18_000_000,
    independence: "savings",
    daysAgo: 0.6,
  },
  {
    name: "Christelle N'Guessan",
    source: "quote",
    status: "new",
    segment: "household",
    location: "abidjan",
    solution: "residential",
    timeline: "asap",
    bill: 140_000,
    generator: 6,
    independence: "maximum",
    daysAgo: 1.4,
    message: "Mainly want backup for the fridge and the children's room fans.",
  },
  {
    name: "Mamadou Traoré",
    company: "Collège Les Palmiers (demo)",
    source: "quote",
    status: "contacted",
    segment: "school",
    location: "bouake",
    solution: "business",
    timeline: "6-months",
    bill: 1_900_000,
    independence: "balanced",
    daysAgo: 3,
    notes: ["Called  the bursar wants a proposal before the board meets in November."],
  },
  {
    name: "Fatou Diabaté",
    company: "Pharmacie du Centre (demo)",
    source: "contact",
    status: "contacted",
    segment: "clinic",
    location: "daloa",
    solution: "backup",
    timeline: "3-months",
    bill: 650_000,
    generator: 15,
    independence: "maximum",
    daysAgo: 4,
    message: "Our vaccine fridge is the priority. What would a backup system involve?",
  },
  {
    name: "Serge Konan",
    company: "Konan & Fils Quincaillerie (demo)",
    source: "calculator",
    status: "site-visit",
    segment: "retail",
    location: "yamoussoukro",
    solution: "business",
    timeline: "3-months",
    bill: 1_200_000,
    independence: "savings",
    daysAgo: 8,
    notes: ["Site visit booked. Roof is fibre-cement  check load capacity."],
  },
  {
    name: "Awa Ouattara",
    company: "Clinique Espérance (demo)",
    source: "quote",
    status: "proposal",
    segment: "clinic",
    location: "korhogo",
    solution: "backup",
    timeline: "asap",
    bill: 2_400_000,
    generator: 30,
    independence: "maximum",
    daysAgo: 13,
    notes: ["Visit done. Generator runs most nights.", "Proposal sent: 48 kWp + 120 kWh."],
  },
  {
    name: "Jean-Marc Yao",
    company: "Bureaux Plateau Sud (demo)",
    source: "quote",
    status: "proposal",
    segment: "office",
    location: "abidjan",
    solution: "commercial",
    timeline: "6-months",
    bill: 6_500_000,
    independence: "savings",
    daysAgo: 17,
    notes: ["Landlord and tenant both need to sign  proposal sent to both."],
  },
  {
    name: "Mariam Bamba",
    company: "Restaurant Le Maquis Moderne (demo)",
    source: "calculator",
    status: "won",
    segment: "restaurant",
    location: "abidjan",
    solution: "business",
    timeline: "asap",
    bill: 900_000,
    generator: 8,
    independence: "balanced",
    daysAgo: 34,
    notes: ["Signed. Installation scheduled."],
  },
  {
    name: "Didier Koffi",
    company: "Imprimerie Koffi (demo)",
    source: "quote",
    status: "won",
    segment: "industrial",
    location: "san-pedro",
    solution: "industrial",
    timeline: "3-months",
    bill: 7_200_000,
    independence: "savings",
    daysAgo: 52,
    notes: ["Signed with 12-month instalment plan."],
  },
  {
    name: "Nadia Touré",
    source: "contact",
    status: "won",
    segment: "household",
    location: "abidjan",
    solution: "residential",
    timeline: "asap",
    bill: 180_000,
    generator: 5,
    independence: "balanced",
    daysAgo: 61,
    message: "Recommended by a neighbour who had a system installed.",
  },
  {
    name: "Paul Gnagne",
    company: "Supérette Gnagne (demo)",
    source: "calculator",
    status: "lost",
    segment: "retail",
    location: "daloa",
    solution: "business",
    timeline: "exploring",
    bill: 450_000,
    independence: "savings",
    daysAgo: 40,
    notes: ["Decided to wait  budget committed elsewhere this year."],
  },
  {
    name: "Salimata Koné",
    company: "Koné Immobilier (demo)",
    source: "contact",
    status: "contacted",
    segment: "office",
    location: "abidjan",
    solution: "monitoring",
    timeline: "exploring",
    bill: 3_100_000,
    independence: "savings",
    daysAgo: 6,
    message:
      "We manage four residential buildings and want to understand monitoring for common areas.",
  },
  {
    name: "Eric Assi",
    source: "calculator",
    status: "new",
    segment: "household",
    location: "yamoussoukro",
    solution: "residential",
    timeline: "exploring",
    bill: 95_000,
    independence: "balanced",
    daysAgo: 2.2,
  },
];

export function seedLeads(now = new Date()): Lead[] {
  return DEMO_LEADS.map((seed, index): Lead => {
    const created = new Date(now.getTime() - seed.daysAgo * 86_400_000);
    const createdAt = created.toISOString();
    const result = estimate({
      segment: seed.segment,
      location: seed.location,
      independence: seed.independence,
      monthlyBillXof: seed.bill,
      generatorHoursPerWeek: seed.generator,
    });
    const slug = seed.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z]+/g, ".");

    return {
      id: newId(),
      reference: newReference(created),
      createdAt,
      updatedAt: createdAt,
      source: seed.source,
      status: seed.status,
      contact: {
        name: seed.name,
        email: `${slug.replace(/^\.|\.$/g, "")}@example.com`,
        phone: `+225 07 00 00 ${String(10 + index).padStart(2, "0")} 00`,
        company: seed.company,
      },
      site: {
        segment: seed.segment,
        location: seed.location,
        solution: seed.solution,
        timeline: seed.timeline,
        monthlyBillXof: seed.bill,
        generatorHoursPerWeek: seed.generator,
      },
      topic: seed.source === "contact" ? "sales" : undefined,
      message: seed.message,
      estimate: {
        independence: seed.independence,
        systemKwp: result.systemKwp,
        batteryKwh: result.batteryKwh,
        solarShare: result.solarShare,
        monthlySavingsXof: result.monthlySavingsXof,
        investmentMidXof: result.investmentXof.mid,
        paybackLowYears: result.paybackYears.low,
        paybackHighYears: result.paybackYears.high,
      },
      activity: [
        { id: newId(), at: createdAt, kind: "created", text: "Request received", by: "Website" },
        ...(seed.notes ?? []).map((text, n) => ({
          id: newId(),
          at: new Date(created.getTime() + (n + 1) * 26 * 3_600_000).toISOString(),
          kind: "note" as const,
          text,
          by: "Kora team",
        })),
      ],
      consentAt: createdAt,
      demo: true,
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
