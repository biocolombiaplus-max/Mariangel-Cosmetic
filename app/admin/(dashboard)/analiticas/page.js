import { readAnalytics, funnelStats } from "@/lib/visits";
import AnalyticsFunnel from "@/components/admin/analytics-funnel";

export default async function AnalyticsPage({ searchParams }) {
  const params = await searchParams;
  const days = params?.days === "30" ? 30 : 7;
  const data = await readAnalytics();
  const funnel = funnelStats(data, days);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-deep-900">📈 Analíticas de la campaña</h1>
      <p className="mt-1 text-brand-deep-900/60">
        De cada 100 personas que entran a tu tienda, aquí ves cuántas llegan a cada paso —
        igual que el reporte de ventas de Shopify.
      </p>

      <AnalyticsFunnel funnel={funnel} days={days} />
    </div>
  );
}
