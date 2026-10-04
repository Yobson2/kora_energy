import { ImageResponse } from "next/og";
import { siteConfig } from "@/app/lib/site";
import { LOAD_SHAPE, SOLAR_SHAPE } from "@/app/lib/solar/assumptions";

/**
 * Social card, generated so it can never 404 and always matches the brand.
 * Runs in an isolated renderer without the stylesheet, so token values are
 * written literally here.
 */
export const alt = `${siteConfig.name}  ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  // A miniature of the site's day curve: hotel load against the sun.
  const load = LOAD_SHAPE.hotel;
  const maxLoad = Math.max(...load);
  const bars = SOLAR_SHAPE.map((sun, h) => ({ sun, load: load[h]! / maxLoad }));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0f2a2e",
        color: "#ffffff",
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{ width: 44, height: 22, borderRadius: "44px 44px 0 0", background: "#f2a516" }}
        />
        <div style={{ fontSize: 34, fontWeight: 700 }}>Kora Energy</div>
        <div style={{ fontSize: 22, color: "#b4c4c1", marginLeft: 12 }}>Concept project</div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 160 }}>
        {bars.map((b, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              width: 34,
              height: 160,
            }}
          >
            <div
              style={{ height: Math.round(b.sun * 120), background: "#f2a516", borderRadius: 3 }}
            />
            <div
              style={{ height: 4, marginTop: 4, background: b.load > 0.8 ? "#ffffff" : "#2c4d52" }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 64,
          lineHeight: 1.05,
          letterSpacing: -2,
          fontWeight: 700,
          maxWidth: 980,
        }}
      >
        Powering African businesses with smarter energy.
      </div>
    </div>,
    size
  );
}
