// Biomarketing's commission is added on top of the admin's own price,
// never carved out of it — Mariangel always sees and edits her own
// "precio base", and the storefront always shows/charges the marked-up
// "precio final". The difference between the two is what funds the
// agency's commission (see lib/commission.js).

export const DEFAULT_MARKUP_PCT = 5;

export function markupPct(settings) {
  const pct = Number(settings?.biomarketingMarginPct);
  return Number.isFinite(pct) && pct >= 0 ? pct : DEFAULT_MARKUP_PCT;
}

// Rounds to the nearest 100 COP so the final price still looks like a
// normal retail price even when the base price isn't a round number.
export function applyMarkup(basePrice, pct) {
  if (basePrice == null) return basePrice;
  const raw = Number(basePrice) * (1 + pct / 100);
  return Math.round(raw / 100) * 100;
}
