"use client";

import { useEffect, useRef, useState } from "react";
import { waLink, buildOrderMessage } from "@/lib/whatsapp";
import { parseJsonResponse } from "@/lib/api-client";
import { money } from "@/lib/format";
import { trackPixelEvent } from "@/lib/meta-pixel-events";
import { trackFunnelEvent } from "@/lib/track-event";
import { baseProductId } from "@/lib/variants";
import FreeShippingNudge from "@/components/free-shipping-nudge";

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
  freeShippingThreshold,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      trackPixelEvent("InitiateCheckout", {
        content_ids: items.map((it) => baseProductId(it.id)),
        num_items: items.reduce((sum, it) => sum + it.qty, 0),
        value: total,
        currency: "COP",
      });
      trackFunnelEvent("checkout_start");
    } else if (wasOpenRef.current && name.trim() && phone.trim()) {
      // Closed without finishing, but we already have a name + WhatsApp —
      // that's enough to follow up, so it lands in the CRM as an
      // abandoned-cart lead instead of being lost. A successful submit
      // already clears name/phone before closing, so this never double
      // fires for a completed order.
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          items,
          total,
          status: "abandonado",
        }),
      }).catch(() => {});
    }
    wasOpenRef.current = open;
    // Only react to `open` transitions, reading whatever name/phone
    // currently hold at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
      // The closest honest signal we have: a WhatsApp order is a
      // qualified lead, not a confirmed payment, so this fires "Lead" —
      // never "Purchase" — which only a real confirmed sale should ever
      // trigger (there is no such moment client-side in this flow).
      trackPixelEvent("Lead", {
        content_ids: items.map((it) => baseProductId(it.id)),
        value: total,
        currency: "COP",
      });
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
        <div className="mb-4">
          <FreeShippingNudge subtotal={total} threshold={freeShippingThreshold} />
        </div>
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
