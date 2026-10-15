"use client";

import { money } from "@/lib/format";

// Purely informational — never blocks or disables checkout. Shows how
// close the cart is to free local delivery, which nudges a bigger basket
// without getting in the way of finishing the purchase.
export default function FreeShippingNudge({ subtotal, threshold }) {
  if (!threshold || threshold <= 0) return null;

  const reached = subtotal >= threshold;
  const pct = Math.max(0, Math.min(100, Math.round((subtotal / threshold) * 100)));

  return (
    <div className="rounded-2xl bg-brand-blush-50 p-3">
      <p className="text-xs font-semibold text-brand-plum-700">
        {reached ? (
          <>🎉 ¡Tu pedido ya tiene domicilio GRATIS!</>
        ) : (
          <>
            🚚 Te faltan <strong>{money(threshold - subtotal)}</strong> para domicilio GRATIS
          </>
        )}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white">
        <div
          className={`h-full rounded-full transition-all ${
            reached ? "bg-green-500" : "brand-gradient"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
