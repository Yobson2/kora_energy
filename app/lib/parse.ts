/**
 * Turns what a person types into a number field into a number, or undefined.
 * Accepts the local habits: "1 250 000", "1.250.000", "1,5", "2 200 000 FCFA".
 */
export function parseAmount(raw: string | null | undefined): number | undefined {
  if (raw === null || raw === undefined) return undefined;
  let text = raw.replace(/[\s  ]/g, "").replace(/[^\d.,-]/g, "");
  if (!text) return undefined;

  // "1.250.000" — dots used as thousands separators.
  if (/^\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, "");
  // "1,250,000" — commas as thousands separators.
  else if (/^\d{1,3}(,\d{3})+$/.test(text)) text = text.replace(/,/g, "");
  // "1,5" — comma as the decimal mark.
  else text = text.replace(",", ".");

  const value = Number(text);
  return Number.isFinite(value) ? value : undefined;
}

/** Inverse for prefilling inputs: grouped, without a unit. */
export function amountToInput(value: number | undefined): string {
  if (value === undefined) return "";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 })
    .format(value)
    .replace(/[  ]/g, " ");
}
