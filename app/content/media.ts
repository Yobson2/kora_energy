import type { StaticImageData } from "next/image";
import rooftopsCity from "@/public/media/rooftops-city-aerial.jpg";
import commercialRoof from "@/public/media/commercial-roof-aerial.jpg";
import warehouses from "@/public/media/warehouses-aerial.jpg";
import homeTropical from "@/public/media/home-solar-tropical.jpg";
import batteryWall from "@/public/media/battery-inverter-wall.jpg";
import monitoringScreen from "@/public/media/monitoring-screen.jpg";
import installerWiring from "@/public/media/installer-wiring.jpg";
import technicianSite from "@/public/media/technician-site.jpg";
import roofDusk from "@/public/media/roof-array-dusk.jpg";
import fieldDuskPoster from "@/public/media/solar-field-dusk-poster.jpg";

/**
 * Every photograph and film on the site, with its licence and credit.
 *
 * All are free-licence stock (Unsplash Licence, Mixkit Free Licence), chosen
 * for what they SHOW — equipment, roofs, installation work — not as stand-ins
 * for Kora's own work. That is why there are none on the project pages: those
 * are concept studies, and a photo there would imply an installation that
 * doesn't exist. Captions call them illustrative wherever context could
 * suggest otherwise.
 *
 * Static imports give next/image the intrinsic size (zero layout shift) and a
 * blur placeholder, and let it serve AVIF/WebP at the right width.
 */

export type Credit = { author: string; url: string; source: "Unsplash" | "Mixkit" };

export type Photo = {
  image: StaticImageData;
  alt: string;
  credit: Credit;
};

const unsplash = (author: string, url: string): Credit => ({ author, url, source: "Unsplash" });

export const photos = {
  rooftopsCity: {
    image: rooftopsCity,
    alt: "Aerial view of a city street with a solar array on the flat roof of an office building.",
    credit: unsplash("Jolame Chirwa", "https://unsplash.com/photos/Oer1kxEHzc4"),
  },
  commercialRoof: {
    image: commercialRoof,
    alt: "Aerial view of a low institutional building whose whole roof is covered in solar panels, surrounded by trees.",
    credit: unsplash("Remco Guijs", "https://unsplash.com/photos/-05jeCg_EZU"),
  },
  warehouses: {
    image: warehouses,
    alt: "Two long warehouse roofs seen from above, both covered edge to edge in rows of solar panels.",
    credit: unsplash("Bernd Dittrich", "https://unsplash.com/photos/40f8WSvB5cU"),
  },
  homeTropical: {
    image: homeTropical,
    alt: "Aerial view of a house among palm trees with solar panels on two roof sections, next to a pool.",
    credit: unsplash("argelis disla", "https://unsplash.com/photos/1Ot6gN266sA"),
  },
  batteryWall: {
    image: batteryWall,
    alt: "A hybrid inverter, two wall-mounted lithium batteries and their breakers installed on a utility-room wall.",
    credit: unsplash("Sergio Martins", "https://unsplash.com/photos/7WzD2mTRWK8"),
  },
  monitoringScreen: {
    image: monitoringScreen,
    alt: "A monitoring screen showing performance figures and trend lines.",
    credit: unsplash("Stephen Dawson", "https://unsplash.com/photos/qwtCeJ5cLYs"),
  },
  installerWiring: {
    image: installerWiring,
    alt: "An installer in work gloves connecting cables to a mounting rail on a roof.",
    credit: unsplash("Florida Solar Fix", "https://unsplash.com/photos/CHTCoA75aPI"),
  },
  technicianSite: {
    image: technicianSite,
    alt: "A technician in a hard hat and high-visibility vest looking across rows of ground-mounted panels on dry, dusty ground.",
    credit: unsplash("Sikwe Scarter", "https://unsplash.com/photos/dnUPzv-eytA"),
  },
  roofDusk: {
    image: roofDusk,
    alt: "Rows of solar panels on a large flat roof as the sun sets behind distant hills.",
    credit: unsplash("Dad hotel", "https://unsplash.com/photos/bRudQ2tGxto"),
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

export const films = {
  fieldDusk: {
    src: "/media/solar-field-dusk.mp4",
    poster: fieldDuskPoster,
    description:
      "Slow aerial shot over rows of solar panels on dry ground in golden evening light.",
    credit: {
      author: "Mixkit",
      url: "https://mixkit.co/free-stock-video/aerial-view-of-solar-panels-in-a-field-at-sunset-46623/",
      source: "Mixkit",
    } satisfies Credit,
  },
};

export const allCredits: Array<{ what: string; credit: Credit }> = [
  ...Object.values(photos).map((p) => ({ what: p.alt, credit: p.credit })),
  { what: films.fieldDusk.description, credit: films.fieldDusk.credit },
];
