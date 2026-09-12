// Strips the internal cost field before a product reaches a public,
// unauthenticated response — cost is only for the admin's own profit
// tracking and must never reach the storefront or an unauthenticated caller.
export function publicProduct(product) {
  const { cost, ...rest } = product;
  return rest;
}
