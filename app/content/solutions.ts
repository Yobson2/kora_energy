import type { SolutionSlug } from "@/app/lib/domain";
import type { Independence, Segment } from "@/app/lib/solar/assumptions";
import type { PhotoKey } from "@/app/content/media";
import type { Locale } from "@/app/lib/i18n";

export type Solution = {
  slug: SolutionSlug;
  name: string;
  /** One line, used in lists and the navigation. */
  summary: string;
  audience: string[];
  problem: string;
  approach: string;
  includes: string[];
  benefits: Array<{ title: string; text: string }>;
  outcome: string;
  /** Typical system size, stated as a range so it reads as a guide, not a quote. */
  typical: string;
  /** Pre-selects the calculator for this kind of customer. */
  calculator: { segment: Segment; independence: Independence };
  /** Illustrative photograph of this kind of installation (see content/media.ts). */
  photo: PhotoKey;
};

export const solutions: Solution[] = [
  {
    slug: "business",
    name: "Business solar",
    summary: "Rooftop systems for shops, offices, restaurants and workshops.",
    audience: ["Shops and supermarkets", "Offices", "Restaurants and cafés", "Workshops"],
    problem:
      "For most small and medium businesses, electricity is one of the few costs that rises every year and can't be negotiated. When the grid drops, a generator takes over  loud, expensive to run, and only as reliable as the last diesel delivery.",
    approach:
      "We size a rooftop array to the hours you're actually open, so almost every kilowatt-hour it produces replaces one you would have bought. Where outages hurt trading, we add a battery for the circuits that matter: tills, lights, refrigeration, internet.",
    includes: [
      "Site survey and roof assessment",
      "Panels, hybrid inverter and mounting",
      "Optional battery for critical circuits",
      "Installation, commissioning and handover",
      "Monitoring app with monthly reports",
    ],
    benefits: [
      {
        title: "Lower bills from the first month",
        text: "Daytime consumption is covered as it happens, so savings start the day the system is switched on.",
      },
      {
        title: "Fewer generator hours",
        text: "Solar carries the load through the day and a battery bridges short cuts, so the generator becomes a last resort.",
      },
      {
        title: "A cost you can plan",
        text: "Once the system is paid for, the energy it produces costs nothing, and tariff rises can't change that.",
      },
    ],
    outcome:
      "Typically 30–60 % of the annual electricity bill, with a payback of roughly three to six years.",
    typical: "10 – 150 kWp",
    calculator: { segment: "retail", independence: "savings" },
    photo: "rooftopsCity",
  },
  {
    slug: "commercial",
    name: "Commercial solar",
    summary: "Larger systems for hotels, clinics, schools and office buildings.",
    audience: [
      "Hotels and guesthouses",
      "Clinics and pharmacies",
      "Schools and universities",
      "Office buildings",
    ],
    problem:
      "Buildings that host people can't simply switch off. Air conditioning, water pumps, lifts and medical equipment run whatever the grid is doing, and every outage has a cost the bill doesn't show: a guest who leaves, a lesson lost, a fridge that warms.",
    approach:
      "We model the building's load hour by hour before we propose anything. That tells us how much array the daytime can absorb, and how much storage it takes to carry the evening peak and protect the circuits you choose.",
    includes: [
      "Hour-by-hour load analysis from your bills or metering",
      "Array and battery design with protected backup circuits",
      "Transfer switching so switchovers are seamless",
      "Installation planned around your occupancy",
      "Monitoring, alerts and preventive maintenance",
    ],
    benefits: [
      {
        title: "Continuity people don't notice",
        text: "Critical circuits switch to the battery in milliseconds, so guests, patients and pupils carry on.",
      },
      {
        title: "Savings at scale",
        text: "Larger systems cost less per kilowatt to build, and buildings that run all day use nearly everything the panels produce.",
      },
      {
        title: "A visible commitment",
        text: "A measured, reported reduction in emissions is something tenants, guests and funders increasingly ask for.",
      },
    ],
    outcome:
      "Typically 40–80 % of the annual load from solar, depending on how much runs after dark.",
    typical: "50 – 500 kWp",
    calculator: { segment: "hotel", independence: "balanced" },
    photo: "commercialRoof",
  },
  {
    slug: "industrial",
    name: "Industrial solar",
    summary: "Large roof and ground arrays for factories, warehouses and processing sites.",
    audience: [
      "Factories and workshops",
      "Warehouses and cold stores",
      "Agro-processing",
      "Industrial zones",
    ],
    problem:
      "Energy-intensive operations feel every tariff change directly in their margins. Large roofs sit unused, and production stops  or switches to costly diesel  whenever supply falters.",
    approach:
      "We treat the system as an infrastructure investment: phased if needed, engineered for your roof structure, and sized against your shift pattern so payback stays as short as the site allows. Storage is added only where the numbers justify it.",
    includes: [
      "Structural assessment and engineering drawings",
      "Roof, carport or ground-mounted arrays",
      "Integration with existing generators and switchgear",
      "Phased installation that keeps production running",
      "Performance reporting against the agreed estimate",
    ],
    benefits: [
      {
        title: "The shortest payback",
        text: "Two-shift daytime operations use nearly all the energy a large array produces.",
      },
      {
        title: "Protection from tariff rises",
        text: "A large share of your energy is locked in at the cost of the system, for 25 years.",
      },
      {
        title: "Production that keeps going",
        text: "Solar works alongside your generators, cutting their fuel use rather than replacing their role.",
      },
    ],
    outcome:
      "Typically 20–40 % of a site's annual electricity, often with a payback under four years.",
    typical: "200 kWp – 2 MWp",
    calculator: { segment: "industrial", independence: "savings" },
    photo: "warehouses",
  },
  {
    slug: "residential",
    name: "Home solar",
    summary: "Panels and batteries that keep a household running through outages.",
    audience: ["Family homes", "Villas and residences", "Small residential buildings"],
    problem:
      "At home, outages arrive in the evening when everyone is back: no fans, no lights, a fridge losing its cold, and a petrol generator running in the yard.",
    approach:
      "We separate the essentials onto a backup circuit and size a battery to carry them through the night. The array is sized to recharge that battery on an ordinary day, with savings on the bill as a welcome extra.",
    includes: [
      "Home visit and essential-circuit plan",
      "Panels, hybrid inverter and battery",
      "Backup panel for lights, fans, fridge and internet",
      "Clean installation and a walk-through on handover",
      "App to see production and battery level",
    ],
    benefits: [
      {
        title: "Quiet evenings",
        text: "Lights, fans and the fridge stay on through a cut, with no generator noise or fumes.",
      },
      {
        title: "A smaller bill",
        text: "Daytime use is covered by the sun, and the battery shifts some of it into the evening.",
      },
      {
        title: "Sized to your home",
        text: "We design for the circuits you choose, so you're not paying to back up the whole house.",
      },
    ],
    outcome:
      "Reliable backup for essentials, and typically 40–70 % of household consumption from solar.",
    typical: "3 – 15 kWp",
    calculator: { segment: "household", independence: "balanced" },
    photo: "homeTropical",
  },
  {
    slug: "backup",
    name: "Backup power",
    summary: "Battery systems that keep critical equipment on when the grid isn't.",
    audience: [
      "Clinics and laboratories",
      "Data and telecom rooms",
      "Cold chain",
      "Any site where a cut costs more than the bill",
    ],
    problem:
      "For some equipment, a few minutes without power is the whole cost: a vaccine fridge, a server, a production line mid-batch. Generators take time to start and need someone to start them.",
    approach:
      "We identify the loads that must never stop and build around them: a battery sized for the outages you actually experience, automatic switching measured in milliseconds, and solar to recharge it so backup doesn't depend on fuel.",
    includes: [
      "Critical-load audit and outage history review",
      "Lithium iron phosphate storage with automatic switching",
      "Solar recharging, with generator integration if needed",
      "Remote alerts when the system switches or runs low",
      "Maintenance plan with battery health reports",
    ],
    benefits: [
      {
        title: "No gap at all",
        text: "Protected circuits switch over faster than equipment can notice.",
      },
      {
        title: "Backup that recharges itself",
        text: "Solar refills the battery during the day, so readiness doesn't depend on a fuel delivery.",
      },
      {
        title: "You'll know before it matters",
        text: "Alerts reach your phone when the system switches or the battery runs low.",
      },
    ],
    outcome:
      "Protected circuits stay powered through typical outages, without waiting for a generator to start.",
    typical: "10 – 400 kWh of storage",
    calculator: { segment: "clinic", independence: "maximum" },
    photo: "batteryWall",
  },
  {
    slug: "monitoring",
    name: "Energy monitoring",
    summary: "See where your energy goes, catch faults early, and prove your savings.",
    audience: [
      "Every Kora system",
      "Multi-site businesses",
      "Property managers",
      "Sites without solar, yet",
    ],
    problem:
      "Most businesses learn what they used when the bill arrives, a month too late to change anything. Faults stay invisible until something stops, and the savings from efficiency work are hard to prove.",
    approach:
      "Meters on your main circuits feed a dashboard that shows consumption, solar production and battery state in real time. We flag unusual patterns  a compressor that's starting to fail, air conditioning running all night  and report each month against the estimate we gave you.",
    includes: [
      "Smart meters on the main and critical circuits",
      "Real-time dashboard on web and mobile",
      "Alerts for faults and unusual consumption",
      "Monthly report against your original estimate",
      "Works with or without solar",
    ],
    benefits: [
      {
        title: "Decisions with data",
        text: "See which equipment and which hours drive your bill, before you invest in anything.",
      },
      {
        title: "Faults found early",
        text: "A rising draw on one circuit is often the first sign that equipment is about to fail.",
      },
      {
        title: "Savings you can prove",
        text: "Monthly reports compare actual performance with what we promised, line by line.",
      },
    ],
    outcome:
      "Most sites find savings of 5–15 % from changes in operation alone, before any new equipment.",
    typical: "From a single meter to whole portfolios",
    calculator: { segment: "office", independence: "savings" },
    photo: "monitoringScreen",
  },
];

export function getSolution(slug: string, locale: Locale = "en"): Solution | undefined {
  return getSolutions(locale).find((s) => s.slug === slug);
}

type SolutionText = Pick<
  Solution,
  | "name"
  | "summary"
  | "audience"
  | "problem"
  | "approach"
  | "includes"
  | "benefits"
  | "outcome"
  | "typical"
>;

/** French text for each solution. Slugs, calculator presets and photos are shared above. */
const SOLUTIONS_FR: Record<SolutionSlug, SolutionText> = {
  business: {
    name: "Solaire pour les entreprises",
    summary: "Des installations en toiture pour les commerces, bureaux, restaurants et ateliers.",
    audience: ["Commerces et supermarchés", "Bureaux", "Restaurants et cafés", "Ateliers"],
    problem:
      "Pour la plupart des PME, l'électricité est l'une des rares charges qui augmente chaque année et ne se négocie pas. Quand le réseau tombe, un groupe électrogène prend le relais : bruyant, coûteux à faire tourner, et aussi fiable que la dernière livraison de gazole.",
    approach:
      "Nous dimensionnons la centrale en toiture sur vos heures d'ouverture réelles, pour que presque chaque kilowattheure produit remplace un kilowattheure que vous auriez acheté. Là où les coupures pèsent sur l'activité, nous ajoutons une batterie pour les circuits qui comptent : caisses, éclairage, froid, internet.",
    includes: [
      "Visite technique et étude de la toiture",
      "Panneaux, onduleur hybride et structure",
      "Batterie en option pour les circuits critiques",
      "Installation, mise en service et remise des clés",
      "Application de suivi avec rapports mensuels",
    ],
    benefits: [
      {
        title: "Une facture plus basse dès le premier mois",
        text: "La consommation de jour est couverte au fil de l'eau : les économies commencent le jour de la mise en service.",
      },
      {
        title: "Moins d'heures de groupe électrogène",
        text: "Le solaire porte la charge pendant la journée et une batterie couvre les coupures courtes : le groupe devient un dernier recours.",
      },
      {
        title: "Un coût prévisible",
        text: "Une fois le système payé, l'énergie qu'il produit ne coûte rien, et les hausses de tarif n'y changent rien.",
      },
    ],
    outcome:
      "En général 30 à 60 % de la facture annuelle d'électricité, avec un retour sur investissement d'environ trois à six ans.",
    typical: "10 – 150 kWc",
  },
  commercial: {
    name: "Solaire tertiaire",
    summary: "Des systèmes plus grands pour les hôtels, cliniques, écoles et immeubles de bureaux.",
    audience: [
      "Hôtels et maisons d'hôtes",
      "Cliniques et pharmacies",
      "Écoles et universités",
      "Immeubles de bureaux",
    ],
    problem:
      "Les bâtiments qui accueillent du public ne peuvent pas simplement s'éteindre. Climatisation, pompes à eau, ascenseurs et équipements médicaux tournent quoi que fasse le réseau, et chaque coupure a un coût que la facture ne montre pas : un client qui part, un cours perdu, un réfrigérateur qui se réchauffe.",
    approach:
      "Nous modélisons la consommation du bâtiment heure par heure avant de proposer quoi que ce soit. Cela indique combien de panneaux la journée peut absorber, et combien de stockage il faut pour passer le pic du soir et protéger les circuits que vous choisissez.",
    includes: [
      "Analyse horaire de la consommation à partir de vos factures ou relevés",
      "Conception de la centrale et de la batterie avec circuits de secours protégés",
      "Inverseur de source pour des basculements imperceptibles",
      "Installation planifiée selon l'occupation des lieux",
      "Suivi, alertes et maintenance préventive",
    ],
    benefits: [
      {
        title: "Une continuité que personne ne remarque",
        text: "Les circuits critiques basculent sur batterie en quelques millisecondes : clients, patients et élèves poursuivent leur activité.",
      },
      {
        title: "Des économies à grande échelle",
        text: "Les grands systèmes coûtent moins cher au kilowatt, et les bâtiments actifs toute la journée consomment presque tout ce que produisent les panneaux.",
      },
      {
        title: "Un engagement visible",
        text: "Une baisse d'émissions mesurée et documentée est de plus en plus demandée par les locataires, les clients et les financeurs.",
      },
    ],
    outcome:
      "En général 40 à 80 % de la consommation annuelle couverte par le solaire, selon la part qui tourne après la tombée de la nuit.",
    typical: "50 – 500 kWc",
  },
  industrial: {
    name: "Solaire industriel",
    summary:
      "De grandes centrales en toiture ou au sol pour les usines, entrepôts et sites de transformation.",
    audience: [
      "Usines et ateliers",
      "Entrepôts et chambres froides",
      "Agro-transformation",
      "Zones industrielles",
    ],
    problem:
      "Les activités énergivores ressentent chaque changement de tarif directement dans leurs marges. De grandes toitures restent inutilisées, et la production s'arrête, ou passe au gazole coûteux, dès que l'alimentation faiblit.",
    approach:
      "Nous traitons le système comme un investissement d'infrastructure : par phases si besoin, conçu pour votre charpente et dimensionné sur vos horaires d'équipes, pour un retour sur investissement aussi court que le site le permet. Le stockage n'est ajouté que là où les chiffres le justifient.",
    includes: [
      "Étude structurelle et plans d'exécution",
      "Centrales en toiture, en ombrière ou au sol",
      "Intégration aux groupes électrogènes et tableaux existants",
      "Installation par phases sans arrêt de la production",
      "Rapports de performance comparés à l'estimation convenue",
    ],
    benefits: [
      {
        title: "Le retour sur investissement le plus court",
        text: "Une activité de jour en deux équipes consomme presque toute l'énergie d'une grande centrale.",
      },
      {
        title: "À l'abri des hausses de tarif",
        text: "Une large part de votre énergie est fixée au coût du système, pour 25 ans.",
      },
      {
        title: "Une production qui continue",
        text: "Le solaire fonctionne avec vos groupes électrogènes : il réduit leur consommation de carburant sans remplacer leur rôle.",
      },
    ],
    outcome:
      "En général 20 à 40 % de l'électricité annuelle du site, souvent avec un retour sur investissement de moins de quatre ans.",
    typical: "200 kWc – 2 MWc",
  },
  residential: {
    name: "Solaire résidentiel",
    summary: "Des panneaux et des batteries qui font tourner la maison pendant les coupures.",
    audience: ["Maisons familiales", "Villas et résidences", "Petits immeubles d'habitation"],
    problem:
      "À la maison, les coupures arrivent le soir, quand tout le monde est rentré : plus de ventilateurs, plus de lumière, un réfrigérateur qui perd son froid, et un groupe à essence qui tourne dans la cour.",
    approach:
      "Nous regroupons l'essentiel sur un circuit de secours et dimensionnons une batterie pour le porter toute la nuit. La centrale est calculée pour recharger cette batterie lors d'une journée ordinaire, les économies sur la facture venant en plus.",
    includes: [
      "Visite à domicile et plan des circuits essentiels",
      "Panneaux, onduleur hybride et batterie",
      "Tableau de secours pour éclairage, ventilateurs, réfrigérateur et internet",
      "Installation soignée et visite explicative à la remise",
      "Application pour voir la production et le niveau de batterie",
    ],
    benefits: [
      {
        title: "Des soirées calmes",
        text: "Éclairage, ventilateurs et réfrigérateur restent allumés pendant une coupure, sans bruit ni fumée de groupe.",
      },
      {
        title: "Une facture plus légère",
        text: "La consommation de jour est couverte par le soleil, et la batterie en reporte une partie sur la soirée.",
      },
      {
        title: "Adapté à votre maison",
        text: "Nous concevons pour les circuits que vous choisissez : vous ne payez pas pour secourir toute la maison.",
      },
    ],
    outcome:
      "Un secours fiable pour l'essentiel, et en général 40 à 70 % de la consommation du foyer couverte par le solaire.",
    typical: "3 – 15 kWc",
  },
  backup: {
    name: "Alimentation de secours",
    summary:
      "Des batteries qui maintiennent les équipements critiques quand le réseau ne suit pas.",
    audience: [
      "Cliniques et laboratoires",
      "Salles informatiques et télécoms",
      "Chaîne du froid",
      "Tout site où une coupure coûte plus que la facture",
    ],
    problem:
      "Pour certains équipements, quelques minutes sans courant représentent tout le coût : un réfrigérateur à vaccins, un serveur, une ligne de production en plein lot. Un groupe électrogène met du temps à démarrer et il faut quelqu'un pour le lancer.",
    approach:
      "Nous identifions les charges qui ne doivent jamais s'arrêter et construisons autour d'elles : une batterie dimensionnée pour les coupures que vous subissez réellement, un basculement automatique en millisecondes, et du solaire pour la recharger afin que le secours ne dépende pas du carburant.",
    includes: [
      "Audit des charges critiques et de l'historique des coupures",
      "Stockage lithium fer phosphate avec basculement automatique",
      "Recharge solaire, avec intégration du groupe électrogène si besoin",
      "Alertes à distance lors d'un basculement ou d'une batterie faible",
      "Plan de maintenance avec rapports sur l'état de la batterie",
    ],
    benefits: [
      {
        title: "Aucune interruption",
        text: "Les circuits protégés basculent plus vite que les équipements ne peuvent le percevoir.",
      },
      {
        title: "Un secours qui se recharge seul",
        text: "Le solaire remplit la batterie pendant la journée : la disponibilité ne dépend pas d'une livraison de carburant.",
      },
      {
        title: "Prévenu avant que ça compte",
        text: "Des alertes arrivent sur votre téléphone quand le système bascule ou que la batterie faiblit.",
      },
    ],
    outcome:
      "Les circuits protégés restent alimentés pendant les coupures habituelles, sans attendre le démarrage d'un groupe.",
    typical: "10 – 400 kWh de stockage",
  },
  monitoring: {
    name: "Suivi énergétique",
    summary: "Voyez où va votre énergie, détectez les pannes tôt et prouvez vos économies.",
    audience: [
      "Tous les systèmes Kora",
      "Entreprises multisites",
      "Gestionnaires immobiliers",
      "Sites sans solaire, pour l'instant",
    ],
    problem:
      "La plupart des entreprises découvrent leur consommation à l'arrivée de la facture, un mois trop tard pour agir. Les pannes restent invisibles jusqu'à ce que quelque chose s'arrête, et les économies d'efficacité sont difficiles à prouver.",
    approach:
      "Des compteurs sur vos circuits principaux alimentent un tableau de bord qui affiche en temps réel la consommation, la production solaire et l'état de la batterie. Nous signalons les comportements inhabituels, comme un compresseur qui commence à faiblir ou une climatisation qui tourne toute la nuit, et rendons compte chaque mois par rapport à l'estimation fournie.",
    includes: [
      "Compteurs intelligents sur les circuits principaux et critiques",
      "Tableau de bord en temps réel sur web et mobile",
      "Alertes en cas de panne ou de consommation inhabituelle",
      "Rapport mensuel comparé à votre estimation initiale",
      "Fonctionne avec ou sans solaire",
    ],
    benefits: [
      {
        title: "Décider sur des données",
        text: "Voyez quels équipements et quelles heures pèsent sur votre facture, avant d'investir dans quoi que ce soit.",
      },
      {
        title: "Des pannes détectées tôt",
        text: "Une consommation qui grimpe sur un circuit est souvent le premier signe qu'un équipement va lâcher.",
      },
      {
        title: "Des économies prouvées",
        text: "Les rapports mensuels comparent la performance réelle à nos engagements, ligne par ligne.",
      },
    ],
    outcome:
      "La plupart des sites trouvent 5 à 15 % d'économies par de simples changements d'exploitation, avant tout nouvel équipement.",
    typical: "D'un seul compteur à des parcs entiers",
  },
};

/** The solutions with their text in `locale`. */
export function getSolutions(locale: Locale): Solution[] {
  return locale === "fr" ? solutions.map((s) => ({ ...s, ...SOLUTIONS_FR[s.slug] })) : solutions;
}
