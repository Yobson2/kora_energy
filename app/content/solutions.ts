import type { SolutionSlug } from "@/app/lib/domain";
import type { Independence, Segment } from "@/app/lib/solar/assumptions";
import type { PhotoKey } from "@/app/content/media";

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
      "For most small and medium businesses, electricity is one of the few costs that rises every year and can't be negotiated. When the grid drops, a generator takes over — loud, expensive to run, and only as reliable as the last diesel delivery.",
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
      "Energy-intensive operations feel every tariff change directly in their margins. Large roofs sit unused, and production stops — or switches to costly diesel — whenever supply falters.",
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
      "Meters on your main circuits feed a dashboard that shows consumption, solar production and battery state in real time. We flag unusual patterns — a compressor that's starting to fail, air conditioning running all night — and report each month against the estimate we gave you.",
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

export function getSolution(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}
