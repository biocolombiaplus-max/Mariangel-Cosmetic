import Link from "next/link";
import { readStore, money } from "@/lib/store";
import { computeStats } from "@/lib/analytics";
import { STAGES } from "@/lib/crm";

export default async function AdminHomePage() {
  const data = await readStore();
  const { products } = data;
  const stats = computeStats(data);

  const kpis = [
    { label: "Ingresos confirmados", value: money(stats.revenue), icon: "💰", highlight: true },
    { label: "Ganancia estimada", value: money(stats.profit), icon: "📈", highlight: true },
    { label: "Valor en negociación", value: money(stats.pipelineValue), icon: "🔄" },
    { label: "Tasa de cierre", value: `${stats.conversionRate}%`, icon: "🎯" },
  ];

  const catalogStats = [
    { label: "Productos activos", value: products.filter((p) => p.active).length, icon: "🛍️" },
    { label: "Destacados", value: products.filter((p) => p.featured).length, icon: "✨" },
    { label: "Agotados", value: products.filter((p) => p.stock <= 0).length, icon: "⚠️" },
    { label: "Pedidos totales", value: stats.totalOrders, icon: "📦" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-deep-900">Hola, bienvenida 👋</h1>
      <p className="mt-1 text-brand-deep-900/60">
        Este es el estado real de tu negocio: ganancia, pedidos y catálogo, todo en un solo lugar.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl p-5 shadow-sm ring-1 ${
              s.highlight
                ? "bg-brand-deep-900 text-white ring-brand-deep-900"
                : "bg-white ring-brand-blush-100"
            }`}
          >
            <span className="text-2xl">{s.icon}</span>
            <p
              className={`mt-2 text-xl font-bold ${s.highlight ? "text-white" : "text-brand-deep-900"}`}
            >
              {s.value}
            </p>
            <p className={`text-xs ${s.highlight ? "text-white/70" : "text-brand-deep-900/60"}`}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {catalogStats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blush-100">
            <span className="text-2xl">{s.icon}</span>
            <p className="mt-2 text-xl font-bold text-brand-deep-900">{s.value}</p>
            <p className="text-xs text-brand-deep-900/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blush-100 lg:col-span-1">
          <h2 className="mb-4 text-sm font-bold text-brand-deep-900">Pedidos por etapa</h2>
          <div className="space-y-3">
            {STAGES.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                <span className="flex-1 text-sm text-brand-deep-900/70">{s.label}</span>
                <span className="text-sm font-semibold text-brand-deep-900">
                  {stats.ordersByStage[s.key] || 0}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/pedidos"
            className="mt-4 inline-block text-xs font-semibold text-brand-plum-700 hover:underline"
          >
            Ver tablero CRM →
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blush-100 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-brand-deep-900">Pedidos recientes</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-brand-deep-900/50">
              Aún no tienes pedidos. Aparecerán aquí cuando alguien haga checkout por WhatsApp.
            </p>
          ) : (
            <ul className="divide-y divide-brand-blush-100">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-brand-deep-900">{o.customerName}</p>
                    <p className="text-xs text-brand-deep-900/50">
                      {new Date(o.createdAt).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-plum-700">{money(o.total)}</p>
                    <p className="text-xs text-brand-deep-900/50">
                      {STAGES.find((s) => s.key === o.status)?.label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/admin/pedidos"
          className="rounded-full bg-brand-deep-900 px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          💬 Ver CRM de pedidos
        </Link>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-brand-plum-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-plum-700"
        >
          + Agregar producto
        </Link>
        <Link
          href="/admin/contenido"
          className="rounded-full border border-brand-plum-600/30 px-6 py-3 text-sm font-semibold text-brand-plum-700 hover:bg-white"
        >
          🎨 Editar contenido de la landing
        </Link>
      </div>
    </div>
  );
}
