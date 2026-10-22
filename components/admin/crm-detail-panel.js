"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import { remarketingMessage, STAGES } from "@/lib/crm";
import { parseJsonResponse } from "@/lib/api-client";

const ORIGIN_LABELS = {
  floating_button: "botón flotante",
  whatsapp_cta: "sección de contacto",
};

export default function CrmDetailPanel({
  order,
  storeName,
  products = [],
  allOrders = [],
  onClose,
  onUpdate,
  onDelete,
}) {
  const [note, setNote] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [guide, setGuide] = useState(order?.shippingGuide || "");
  const [pickProductId, setPickProductId] = useState("");
  const [pickVariantId, setPickVariantId] = useState("");
  const [pickQty, setPickQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!order) return null;

  async function patch(body) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const updated = await parseJsonResponse(res);
      onUpdate(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function addNote() {
    if (!note.trim()) return;
    await patch({ addNote: note });
    setNote("");
  }

  async function addTag() {
    if (!tagInput.trim()) return;
    await patch({ tags: [...(order.tags || []), tagInput.trim()] });
    setTagInput("");
  }

  function removeTag(tag) {
    patch({ tags: (order.tags || []).filter((t) => t !== tag) });
  }

  async function saveGuide() {
    await patch({ shippingGuide: guide });
  }

  const pickProduct = products.find((p) => p.id === pickProductId);
  const pickVariants = pickProduct?.variants || [];

  async function addItem() {
    if (!pickProductId) return;
    await patch({
      addItem: {
        id: pickVariantId ? `${pickProductId}::${pickVariantId}` : pickProductId,
        qty: pickQty,
      },
    });
    setPickProductId("");
    setPickVariantId("");
    setPickQty(1);
  }

  function removeItem(itemId) {
    patch({ removeItemId: itemId });
  }

  async function remove() {
    if (!confirm(`¿Eliminar el pedido de ${order.customerName}? No se puede deshacer.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
      await parseJsonResponse(res);
      onDelete(order.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const remarketingHref = waLink(order.customerPhone, remarketingMessage(storeName, order));
  const webOrigin = order.source?.startsWith("consulta_web") ? order.source.split(":")[1] : null;
  const isReturningCustomer = allOrders.some(
    (o) => o.id !== order.id && o.customerPhone === order.customerPhone && o.status === "ganado"
  );
  const loyaltyCode = `RECOMPRA10-${String(order.customerPhone || "").slice(-4)}`;

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-blush-100 px-5 py-4">
          <h2 className="text-lg font-bold text-brand-deep-900">{order.customerName}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-brand-plum-700 hover:bg-brand-blush-50"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-6 px-5 py-5">
          <div>
            <p className="text-xs text-brand-deep-900/50">
              {new Date(order.createdAt).toLocaleString("es-CO")}
            </p>
            <p className="mt-1 text-sm text-brand-deep-900/70">📱 +{order.customerPhone}</p>
            {webOrigin && (
              <span className="mt-2 inline-block rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                💬 Consulta general desde la página web ({ORIGIN_LABELS[webOrigin] || webOrigin})
              </span>
            )}
          </div>

          {isReturningCustomer && (
            <div className="rounded-xl bg-brand-blush-50 p-3">
              <p className="text-sm font-semibold text-brand-plum-700">🎁 Clienta recurrente</p>
              <p className="mt-1 text-xs text-brand-deep-900/60">
                Ya tiene otra compra ganada antes. Puedes ofrecerle este código de descuento por
                WhatsApp (tú decides si aplicarlo y cuánto):
              </p>
              <p className="mt-1.5 inline-block rounded-lg bg-white px-2.5 py-1 font-mono text-sm font-bold text-brand-plum-700">
                {loyaltyCode}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-deep-900/50">
              Etapa
            </label>
            <select
              value={order.status}
              disabled={busy}
              onChange={(e) => patch({ status: e.target.value })}
              className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
            >
              {STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <a
            href={remarketingHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-sm hover:brightness-95"
          >
            💬 Escribir por WhatsApp
          </a>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-deep-900/50">
              Pedido
            </h3>
            {order.items.length === 0 ? (
              <p className="mb-2 text-xs text-brand-deep-900/50">
                Esta consulta llegó sin un producto específico. Agrega aquí lo que le vendiste
                para que cuente en tu ganancia y en la comisión de Biomarketing.
              </p>
            ) : (
              <ul className="space-y-2 rounded-xl bg-brand-blush-50 p-3 text-sm">
                {order.items.map((it, i) => (
                  <li
                    key={it.id + i}
                    className="flex items-center justify-between gap-2 text-brand-deep-900/80"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {it.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.image}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <span className="truncate">
                        {it.name} x{it.qty}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span>{money(it.price * it.qty)}</span>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {order.items.length > 0 && (
              <p className="mt-2 text-right text-sm font-bold text-brand-deep-900">
                Total: {money(order.total)}
              </p>
            )}

            {products.length > 0 && (
              <div className="mt-3 space-y-2 rounded-xl border border-dashed border-brand-pink-200 p-3">
                <p className="text-xs font-semibold text-brand-deep-900">
                  + Agregar producto vendido
                </p>
                <div className="flex gap-2">
                  <select
                    value={pickProductId}
                    onChange={(e) => {
                      setPickProductId(e.target.value);
                      setPickVariantId("");
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-brand-pink-200 px-2 py-2 text-sm outline-none focus:border-brand-plum-600"
                  >
                    <option value="">Elige un producto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={pickQty}
                    onChange={(e) => setPickQty(Math.max(1, Number(e.target.value) || 1))}
                    className="w-16 rounded-lg border border-brand-pink-200 px-2 py-2 text-sm outline-none focus:border-brand-plum-600"
                  />
                </div>
                {pickVariants.length > 0 && (
                  <select
                    value={pickVariantId}
                    onChange={(e) => setPickVariantId(e.target.value)}
                    className="w-full rounded-lg border border-brand-pink-200 px-2 py-2 text-sm outline-none focus:border-brand-plum-600"
                  >
                    <option value="">Elige la variante...</option>
                    {pickVariants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {Object.values(v.values).join(" / ")}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={addItem}
                  disabled={!pickProductId || (pickVariants.length > 0 && !pickVariantId) || busy}
                  className="w-full rounded-lg bg-brand-plum-600 py-2 text-xs font-semibold text-white hover:bg-brand-plum-700 disabled:opacity-50"
                >
                  Agregar al pedido
                </button>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-deep-900/50">
              Envío
            </h3>
            <div className="flex gap-2">
              <input
                value={guide}
                onChange={(e) => setGuide(e.target.value)}
                placeholder="Número de guía / transportadora"
                className="flex-1 rounded-xl border border-brand-pink-200 px-3 py-2 text-sm outline-none focus:border-brand-plum-600"
              />
              <button
                onClick={saveGuide}
                className="rounded-xl bg-brand-plum-600 px-4 text-sm font-semibold text-white hover:bg-brand-plum-700"
              >
                Guardar
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-deep-900/50">
              Etiquetas
            </h3>
            <div className="mb-2 flex flex-wrap gap-2">
              {(order.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-brand-pink-200 px-3 py-1 text-xs font-medium text-brand-deep-900"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-brand-deep-900/50">
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Ej. VIP, Recompra..."
                className="flex-1 rounded-xl border border-brand-pink-200 px-3 py-2 text-sm outline-none focus:border-brand-plum-600"
              />
              <button
                onClick={addTag}
                className="rounded-xl bg-brand-plum-600 px-4 text-sm font-semibold text-white hover:bg-brand-plum-700"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-deep-900/50">
              Notas de seguimiento
            </h3>
            <div className="mb-3 space-y-2">
              {(order.notes || []).length === 0 && (
                <p className="text-xs text-brand-deep-900/40">Aún no hay notas.</p>
              )}
              {(order.notes || [])
                .slice()
                .reverse()
                .map((n) => (
                  <div key={n.id} className="rounded-xl bg-brand-blush-50 p-3 text-sm">
                    <p className="text-brand-deep-900/80">{n.text}</p>
                    <p className="mt-1 text-[11px] text-brand-deep-900/40">
                      {new Date(n.createdAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                ))}
            </div>
            <div className="flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNote())}
                placeholder="Agregar nota de seguimiento..."
                className="flex-1 rounded-xl border border-brand-pink-200 px-3 py-2 text-sm outline-none focus:border-brand-plum-600"
              />
              <button
                onClick={addNote}
                className="rounded-xl bg-brand-plum-600 px-4 text-sm font-semibold text-white hover:bg-brand-plum-700"
              >
                Guardar
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="border-t border-brand-blush-100 px-5 py-4">
          <button
            onClick={remove}
            disabled={busy}
            className="w-full rounded-full border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Eliminar pedido
          </button>
        </div>
      </aside>
    </>
  );
}
