"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import { useSiteSave } from "@/components/admin/content/use-site-save";
import SaveBar from "@/components/admin/content/save-bar";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CommissionDashboard({ commission, settings }) {
  const [form, setForm] = useState({
    commissionPerSale: settings.commissionPerSale ?? 1000,
    commissionPayee: settings.commissionPayee ?? "Juan Carlos",
    commissionCycle: settings.commissionCycle ?? "quincenal",
  });
  const { save, saving, saved, error } = useSiteSave();

  const c = commission;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-deep-900">💼 Comisión Biomarketing</h1>
      <p className="mt-1 text-brand-deep-900/60">
        Por cada venta confirmada, {c.payee} gana {money(c.perSale)}. Aquí está el avance del ciclo
        de pago actual y el historial completo.
      </p>

      {/* Hero total card */}
      <div className="brand-gradient relative mt-8 overflow-hidden rounded-3xl p-7 text-white shadow-lg shadow-brand-plum-700/20">
        <span className="pointer-events-none absolute -right-8 -top-8 text-[9rem] opacity-10">💼</span>
        <p className="text-sm font-medium text-white/80">Ganancia acumulada de {c.payee}</p>
        <p className="mt-2 text-5xl font-extrabold tracking-tight">{money(c.totalCommission)}</p>
        <p className="mt-2 text-sm text-white/80">
          {c.totalSales} {c.totalSales === 1 ? "venta confirmada" : "ventas confirmadas"} ×{" "}
          {money(c.perSale)} cada una
        </p>
      </div>

      {/* Stat row */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blush-100">
          <span className="text-2xl">🗓️</span>
          <p className="mt-2 text-xl font-bold text-brand-deep-900">{money(c.currentCycleCommission)}</p>
          <p className="text-xs text-brand-deep-900/60">
            Este ciclo ({c.currentCycleSales} {c.currentCycleSales === 1 ? "venta" : "ventas"})
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blush-100">
          <span className="text-2xl">💵</span>
          <p className="mt-2 text-xl font-bold text-brand-deep-900">{money(c.perSale)}</p>
          <p className="text-xs text-brand-deep-900/60">Por cada venta ganada</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blush-100 col-span-2 lg:col-span-1">
          <span className="text-2xl">💳</span>
          <p className="mt-2 text-xl font-bold text-brand-deep-900">{formatDate(c.nextPaymentDate)}</p>
          <p className="text-xs text-brand-deep-900/60">
            Próximo pago ·{" "}
            {c.daysUntilPayment === 0
              ? "hoy"
              : `en ${c.daysUntilPayment} ${c.daysUntilPayment === 1 ? "día" : "días"}`}
          </p>
        </div>
      </div>

      {/* Cycle progress */}
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-brand-deep-900">Ciclo actual · {c.periodLabel}</h2>
            <p className="text-xs text-brand-deep-900/50">
              Día {c.daysElapsed} de {c.daysTotal} · se paga el {formatDate(c.nextPaymentDate)}
            </p>
          </div>
          <span className="rounded-full bg-brand-blush-100 px-3 py-1 text-xs font-bold text-brand-plum-700">
            {c.progressPct}% del ciclo
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-brand-blush-50">
          <div
            className="brand-gradient h-full rounded-full transition-all"
            style={{ width: `${c.progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Recent sales ledger */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blush-100 lg:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-brand-deep-900">
            Ventas de este ciclo ({c.currentCycleSales})
          </h2>
          {c.recentSales.length === 0 ? (
            <p className="text-sm text-brand-deep-900/50">
              Aún no hay ventas ganadas en este ciclo. Aparecerán aquí apenas muevas un pedido a
              &ldquo;Ganado&rdquo; en el CRM.
            </p>
          ) : (
            <ul className="divide-y divide-brand-blush-100">
              {c.recentSales.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-brand-deep-900">{s.customerName}</p>
                    <p className="text-xs text-brand-deep-900/50">{formatDate(s.date)}</p>
                  </div>
                  <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                    +{money(s.commission)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* History */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blush-100">
          <h2 className="mb-4 text-sm font-bold text-brand-deep-900">Ciclos anteriores</h2>
          <div className="space-y-3">
            {c.history.map((h) => (
              <div key={h.label} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-brand-deep-900">{h.label}</p>
                  <p className="text-xs text-brand-deep-900/50">
                    {h.sales} {h.sales === 1 ? "venta" : "ventas"}
                  </p>
                </div>
                <span className="font-semibold text-brand-plum-700">{money(h.commission)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mt-6 max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
        <h2 className="text-sm font-bold text-brand-deep-900">⚙️ Configuración de la comisión</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-deep-900">
              Monto por venta (COP)
            </label>
            <input
              type="number"
              min="0"
              value={form.commissionPerSale}
              onChange={(e) =>
                setForm((f) => ({ ...f, commissionPerSale: e.target.value }))
              }
              className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-deep-900">Beneficiario</label>
            <input
              value={form.commissionPayee}
              onChange={(e) => setForm((f) => ({ ...f, commissionPayee: e.target.value }))}
              className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Ciclo de pago</label>
          <div className="flex gap-2">
            {[
              { value: "quincenal", label: "Quincenal (1–15 y 16–fin de mes)" },
              { value: "mensual", label: "Mensual (fin de mes)" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, commissionCycle: opt.value }))}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  form.commissionCycle === opt.value
                    ? "border-brand-plum-600 bg-brand-blush-50 text-brand-plum-700"
                    : "border-brand-pink-200 text-brand-deep-900 hover:bg-brand-blush-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <SaveBar
          onSave={() =>
            save({
              settings: {
                commissionPerSale: Number(form.commissionPerSale) || 0,
                commissionPayee: form.commissionPayee.trim() || "Juan Carlos",
                commissionCycle: form.commissionCycle,
              },
            })
          }
          saving={saving}
          saved={saved}
          error={error}
        />
      </div>
    </div>
  );
}
