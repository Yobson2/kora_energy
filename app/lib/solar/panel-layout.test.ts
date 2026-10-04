import { describe, expect, it } from "vitest";
import { layoutPanels, panelCount } from "./panel-layout";

// Mirrors the seeded case studies (app/server/seed.ts). If a project's roof
// cannot physically hold its array, the drawing would silently show fewer
// panels than the capacity claims — this catches that.
const PROJECTS = [
  { kwp: 160, roof: { width: 42, depth: 28 } },
  { kwp: 60, roof: { width: 36, depth: 12 } },
  { kwp: 420, roof: { width: 80, depth: 40 } },
  { kwp: 95, roof: { width: 32, depth: 22 } },
  { kwp: 24, roof: { width: 14, depth: 12 } },
  { kwp: 8, roof: { width: 11, depth: 8 } },
];

describe("layoutPanels", () => {
  it.each(PROJECTS)("fits $kwp kWp on a $roof.width × $roof.depth m roof", ({ kwp, roof }) => {
    const count = panelCount(kwp);
    const { panels, capacity } = layoutPanels(roof, count);
    expect(capacity).toBeGreaterThanOrEqual(count);
    expect(panels).toHaveLength(count);
  });

  it("keeps every panel inside the roof", () => {
    const roof = { width: 30, depth: 22 };
    const { panels } = layoutPanels(roof, 10_000);
    for (const p of panels) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x + 1.13).toBeLessThanOrEqual(roof.width);
      expect(p.y + 2.28).toBeLessThanOrEqual(roof.depth);
    }
  });
});
