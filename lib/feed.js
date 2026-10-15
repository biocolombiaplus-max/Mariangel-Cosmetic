import { applyMarkup, markupPct } from "@/lib/pricing";

// Meta Commerce Manager's data-feed spec (the same shape Google Shopping
// feeds use): a plain CSV with these column names, one row per product. It
// needs the FINAL price (what the customer actually pays), not Mariangel's
// base price — Meta would otherwise show a price that doesn't match the
// product page it links to.
const FEED_COLUMNS = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "link",
  "image_link",
  "brand",
];

function csvEscape(value) {
  const str = String(value ?? "");
  if (/["\n,]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function absoluteUrl(path, origin) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function buildProductFeedCsv(products, settings, origin) {
  const pct = markupPct(settings);
  const brand = settings?.storeName || "Mariangel Cosmetic";

  const rows = (products || [])
    .filter((p) => p.active)
    .map((p) => [
      p.id,
      p.name,
      (p.description || "").replace(/\s+/g, " ").trim(),
      p.stock > 0 ? "in stock" : "out of stock",
      "new",
      `${applyMarkup(p.price, pct)} COP`,
      absoluteUrl(`/producto/${p.slug}`, origin),
      absoluteUrl(p.images?.[0], origin),
      brand,
    ]);

  const lines = [
    FEED_COLUMNS.join(","),
    ...rows.map((row) => row.map(csvEscape).join(",")),
  ];
  return lines.join("\n");
}
