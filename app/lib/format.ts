/**
 * Display formatting. The site is in English but money is FCFA (XOF), and the
 * local convention groups thousands with a space: "1 250 000 FCFA".
 */

const group = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const group1 = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/** Normalises the narrow no-break space Intl emits to a regular no-break space. */
const nbsp = (value: string) => value.replace(/ /g, " ");

export function formatNumber(value: number, fractionDigits: 0 | 1 = 0): string {
  return nbsp((fractionDigits ? group1 : group).format(value));
}

export function formatXof(value: number): string {
  return `${formatNumber(value)} FCFA`;
}

/** Compact money for tight spaces: "47,5 M FCFA". */
export function formatXofCompact(value: number): string {
  if (value >= 1_000_000_000) return `${formatNumber(value / 1_000_000_000, 1)} Md FCFA`;
  if (value >= 1_000_000) return `${formatNumber(value / 1_000_000, 1)} M FCFA`;
  if (value >= 10_000) return `${formatNumber(value / 1_000)} k FCFA`;
  return formatXof(value);
}

export function formatKwp(value: number): string {
  return `${formatNumber(value, 1)} kWp`;
}

export function formatKwh(value: number): string {
  if (value >= 1_000_000) return `${formatNumber(value / 1_000_000, 1)} GWh`;
  if (value >= 10_000) return `${formatNumber(value / 1_000, 1)} MWh`;
  return `${formatNumber(value)} kWh`;
}

export function formatPercent(share: number): string {
  return `${Math.round(share * 100)} %`;
}

export function formatYears(low: number, high: number): string {
  return `${formatNumber(low, 1)}–${formatNumber(high, 1)} years`;
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Abidjan",
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

/** "3 h ago", "2 days ago" — for the back office, where recency is the point. */
export function formatAge(iso: string, now: Date = new Date()): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}
