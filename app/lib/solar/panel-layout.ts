import { PANEL_WATTS } from "./assumptions";

/**
 * Panel placement for the roof-plan drawings. A simple, honest rule set, not
 * a design tool: portrait modules, a perimeter setback, and a maintenance
 * walkway after every pair of rows.
 */
export const PANEL = { w: 1.13, d: 2.28 }; // a 550 W module in portrait, metres
const GAP = 0.04;
const WALKWAY = 1.0;
const SETBACK = 0.5;

export function panelCount(systemKwp: number): number {
  return Math.ceil((systemKwp * 1000) / PANEL_WATTS);
}

export function layoutPanels(roof: { width: number; depth: number }, count: number) {
  const cols = Math.max(0, Math.floor((roof.width - 2 * SETBACK + GAP) / (PANEL.w + GAP)));
  const limit = roof.depth - SETBACK;

  const rowsY: number[] = [];
  let cursor = SETBACK;
  while (cursor + PANEL.d <= limit + 1e-6) {
    rowsY.push(cursor);
    // Pairs of rows share a walkway: row, gap, row, walkway, …
    cursor += PANEL.d + (rowsY.length % 2 === 0 ? WALKWAY : GAP);
  }

  const panels: Array<{ x: number; y: number }> = [];
  const offset = (roof.width - (cols * (PANEL.w + GAP) - GAP)) / 2;
  for (const y of rowsY) {
    for (let c = 0; c < cols && panels.length < count; c++) {
      panels.push({ x: offset + c * (PANEL.w + GAP), y });
    }
  }
  return { panels, capacity: cols * rowsY.length };
}
