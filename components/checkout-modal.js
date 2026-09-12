"use client";

import { useState } from "react";
import { waLink, buildOrderMessage } from "@/lib/whatsapp";
import { parseJsonResponse } from "@/lib/api-client";
import { money } from "@/lib/format";

// Captures name + WhatsApp before handing off to wa.me. We have no
// WhatsApp Business API access, so this is how every WhatsApp checkout
// becomes a trackable lead/order in the admin CRM instead of vanishing
// into a chat we can't see.
export default function CheckoutModal({
  open,
  onClose,
  whatsapp,
  storeName,
  items,
  total,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: name, customerPhone: phone, items, total }),
      });
      await parseJsonResponse(res);
      const message = buildOrderMessage(storeName, name.trim(), items, total);
      window.open(waLink(whatsapp, message), "_blank", "noopener,noreferrer");
      onSuccess?.();
      onClose();
      setName("");
      setPhone("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-deep-900">Casi listo ✨</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-brand-plum-700 hover:bg-brand-blush-50"
          >
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-brand-deep-900/70">
          Cuéntanos tus datos para darte una atención más rápida y te llevamos a WhatsApp con tu
          pedido listo (Total: <strong>{money(total)}</strong>).
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Tu WhatsApp (ej. 3001234567)"
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-md hover:brightness-95 disabled:opacity-60"
          >
            {loading ? "Un momento..." : "Continuar por WhatsApp"}
          </button>
        </form>
      </div>
    </div>
  );
}
