import { applyMarkup } from "@/lib/pricing";

// Shapes a product for a public, unauthenticated response: strips `cost`
// (admin-only, never shown to customers) and applies Biomarketing's
// percentage markup on top of the admin's own price, the same way for the
// base price, the "compare at" price and every variant override — so every
// price the storefront ever displays or lets a customer buy at is already
// the final, marked-up one. `basePrice` (pre-markup) rides along on both
// the product and each variant so cart/checkout/order code can record the
// exact split later without having to reverse the rounding.
export function publicProduct(product, pct) {
  const { cost, ...rest } = product;
  return {
    ...rest,
    price: applyMarkup(product.price, pct),
    basePrice: product.price,
    compareAtPrice:
      product.compareAtPrice != null ? applyMarkup(product.compareAtPrice, pct) : null,
    variants: (product.variants || []).map((v) => ({
      ...v,
      price: v.price != null ? applyMarkup(v.price, pct) : null,
      basePrice: v.price ?? null,
    })),
  };
}
