// Shopify-style product variants: a product can define option groups
// (e.g. Color: [Rosa, Rojo], Tamaño: [Pequeño, Grande]) and each
// combination of values becomes a variant with its own optional price
// override, stock and image.

export function normalizeOptions(rawOptions) {
  return (rawOptions || [])
    .map((o) => ({
      name: String(o.name || "").trim(),
      values: (o.values || [])
        .map((v) => String(v).trim())
        .filter(Boolean)
        // de-dupe while preserving order
        .filter((v, i, arr) => arr.indexOf(v) === i),
    }))
    .filter((o) => o.name && o.values.length > 0);
}

function cartesian(options) {
  return options.reduce(
    (acc, opt) =>
      acc.flatMap((combo) => opt.values.map((v) => ({ ...combo, [opt.name]: v }))),
    [{}]
  );
}

function sameCombo(a, b) {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
}

// Regenerates the variant list from the current options, reusing
// price/stock/image from any existing variant that still matches a
// combination, and dropping variants that no longer apply.
export function mergeVariants(existingVariants, options) {
  const normalized = normalizeOptions(options);
  if (normalized.length === 0) return [];

  const combos = cartesian(normalized);
  return combos.map((values, i) => {
    const existing = (existingVariants || []).find((v) => sameCombo(v.values, values));
    return {
      id: existing?.id || `v${Date.now()}-${i}`,
      values,
      price: existing?.price ?? null,
      stock: existing?.stock ?? 0,
      image: existing?.image ?? "",
    };
  });
}

export function variantLabel(values) {
  return Object.values(values || {}).join(" / ");
}

export function findVariant(variants, selected) {
  return (variants || []).find((v) => sameCombo(v.values, selected));
}

// Range across variant price overrides, falling back to the base price
// wherever a variant doesn't override it — for the "$X - $Y" grid display.
export function priceRange(product) {
  if (!product.variants?.length) return { min: product.price, max: product.price };
  const prices = product.variants.map((v) => v.price ?? product.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
