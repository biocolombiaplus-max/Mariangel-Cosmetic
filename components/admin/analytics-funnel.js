import Link from "next/link";

function formatDay(iso) {
  return new Date(iso).toLocaleDateString("es-CO", { weekday: "short", day: "numeric" });
}

export default function AnalyticsFunnel({ funnel, days }) {
  const { stages, trend, topSources } = funnel;
  const maxTrend = Math.max(1, ...trend.map((d) => d.count));
  const maxSource = Math.max(1, ...topSources.map((s) => s.count));

  return (
    <div>
      <div className="mt-6 flex gap-2">
        {[
          { value: 7, label: "7 días" },
          { value: 30, label: "30 días" },
        ].map((opt) => (
          <Link
            key={opt.value}
            href={`/admin/analiticas?days=${opt.value}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              days === opt.value
                ? "bg-brand-plum-600 text-white"
                : "bg-white text-brand-deep-900 ring-1 ring-brand-blush-100 hover:bg-brand-blush-50"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Funnel */}
      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
        <h2 className="mb-5 text-sm font-bold text-brand-deep-900">Embudo de conversión</h2>
        <div className="space-y-5">
          {stages.map((stage, i) => (
            <div key={stage.key}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-brand-deep-900">
                  {stage.icon} {stage.label}
                </span>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-lg font-bold text-brand-deep-900">{stage.count}</span>
                  <span className="rounded-full bg-brand-blush-100 px-2 py-0.5 text-[11px] font-bold text-brand-plum-700">
                    {stage.pctOfTotal}%
                  </span>
                </div>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-brand-blush-50">
                <div
                  className="brand-gradient h-full rounded-full transition-all"
                  style={{ width: `${Math.max(2, stage.pctOfTotal)}%` }}
                />
              </div>
              {i > 0 && (
                <p className="mt-1 text-xs text-brand-deep-900/50">
                  {stage.pctOfPrev}% de quienes llegaron al paso anterior
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Trend */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <h2 className="mb-4 text-sm font-bold text-brand-deep-900">Visitas por día</h2>
          <div className="flex h-28 items-end gap-2">
            {trend.map((d) => (
              <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div
                  className="w-full rounded-t-md bg-brand-plum-600"
                  style={{ height: `${Math.max(4, (d.count / maxTrend) * 100)}%` }}
                  title={`${d.count} visitas`}
                />
                {days <= 7 && (
                  <span className="text-[10px] text-brand-deep-900/40">{formatDay(d.date)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <h2 className="mb-1 text-sm font-bold text-brand-deep-900">¿De dónde viene el tráfico?</h2>
          <p className="mb-4 text-xs text-brand-deep-900/50">
            Según el <code>utm_source</code> del link que usaron para entrar.
          </p>
          {topSources.length === 0 ? (
            <p className="text-sm text-brand-deep-900/50">
              Aún no hay datos. Cuando lleguen visitas desde tu anuncio (con los parámetros UTM),
              aparecerán aquí.
            </p>
          ) : (
            <div className="space-y-2.5">
              {topSources.map((s) => (
                <div key={s.source}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="truncate font-medium text-brand-deep-900">{s.source}</span>
                    <span className="shrink-0 font-semibold text-brand-plum-700">{s.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-blush-50">
                    <div
                      className="h-full rounded-full bg-brand-orchid-500"
                      style={{ width: `${Math.max(2, (s.count / maxSource) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
