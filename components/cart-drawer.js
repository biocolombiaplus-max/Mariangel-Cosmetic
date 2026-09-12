"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { money } from "@/lib/format";
import CheckoutModal from "@/components/checkout-modal";

export default function CartDrawer({ whatsapp, storeName }) {
  const { items, isOpen, close, removeItem, updateQty, total, clear } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-brand-blush-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-brand-deep-900">Tu carrito</h2>
          <button
            onClick={close}
            aria-label="Cerrar carrito"
            className="rounded-full p-1.5 text-brand-plum-700 hover:bg-brand-blush-50"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-brand-plum-700/70">
              <span className="text-3xl">🛍️</span>
              <p>Tu carrito está vacío por ahora.</p>
              <Link
                href="/tienda"
                onClick={close}
                className="mt-2 rounded-full bg-brand-plum-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-plum-700"
              >
                Ver catálogo
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-blush-50">
                    {it.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-brand-deep-900 line-clamp-1">
                      {it.name}
                    </span>
                    <span className="text-sm text-brand-orchid-500 font-semibold">
                      {money(it.price)}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(it.id, it.qty - 1)}
                        className="h-6 w-6 rounded-full border border-brand-pink-200 text-brand-plum-700 leading-none"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm">{it.qty}</span>
                      <button
                        onClick={() => updateQty(it.id, it.qty + 1)}
                        className="h-6 w-6 rounded-full border border-brand-pink-200 text-brand-plum-700 leading-none"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="ml-auto text-xs text-brand-plum-700/60 hover:text-brand-plum-700 underline"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-brand-blush-100 px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-brand-plum-700/70">Subtotal</span>
              <span className="text-lg font-bold text-brand-deep-900">{money(total)}</span>
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-md hover:brightness-95"
            >
              Finalizar por WhatsApp
            </button>
            <button
              onClick={clear}
              className="mt-2 w-full text-center text-xs text-brand-plum-700/60 hover:text-brand-plum-700 underline"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        whatsapp={whatsapp}
        storeName={storeName}
        items={items}
        total={total}
        onSuccess={() => {
          clear();
          close();
        }}
      />
    </>
  );
}
