import { STAGES } from "@/lib/crm";

// Computes the admin dashboard's business metrics from orders + the
// product catalog (for cost/profit). Revenue and profit only count
// "ganado" (won) orders — everything else is still-open pipeline value,
// not confirmed sales.
export function computeStats(data) {
  const orders = data.orders || [];
  const products = data.products || [];
  const productById = new Map(products.map((p) => [p.id, p]));

  const wonOrders = orders.filter((o) => o.status === "ganado");
  const openOrders = orders.filter((o) => o.status !== "ganado" && o.status !== "perdido");

  const revenue = wonOrders.reduce((sum, o) => sum + o.total, 0);
  const pipelineValue = openOrders.reduce((sum, o) => sum + o.total, 0);

  const profit = wonOrders.reduce((sum, o) => {
    const orderProfit = o.items.reduce((s, it) => {
      // Variant cart items carry a composite id ("<productId>::<variantId>")
      // — cost is tracked per product, not per variant, so look up the base.
      const baseId = String(it.id).split("::")[0];
      const cost = productById.get(baseId)?.cost || 0;
      return s + (it.price - cost) * it.qty;
    }, 0);
    return sum + orderProfit;
  }, 0);

  const ordersByStage = Object.fromEntries(
    STAGES.map((s) => [s.key, orders.filter((o) => o.status === s.key).length])
  );

  const conversionRate =
    orders.length > 0 ? Math.round((wonOrders.length / orders.length) * 100) : 0;

  const recentOrders = orders
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return {
    totalOrders: orders.length,
    wonOrdersCount: wonOrders.length,
    revenue,
    pipelineValue,
    profit,
    conversionRate,
    ordersByStage,
    recentOrders,
  };
}
