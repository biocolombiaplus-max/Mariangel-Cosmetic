"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { money } from "@/lib/format";

export default function ProductsTable({ initialProducts, categories }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [busyId, setBusyId] = useState(null);

  const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name || slug;

  async function toggle(product, field) {
    setBusyId(product.id);
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !product[field] }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }
    setBusyId(null);
  }

  async function remove(product) {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setBusyId(product.id);
    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-brand-blush-100">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-brand-blush-100 text-brand-deep-900/60">
            <th className="px-4 py-3 font-medium">Producto</th>
            <th className="px-4 py-3 font-medium">Categoría</th>
            <th className="px-4 py-3 font-medium">Precio</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="px-4 py-3 font-medium">Destacado</th>
            <th className="px-4 py-3 font-medium">Activo</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-brand-blush-50 last:border-0">
              <td className="flex items-center gap-3 px-4 py-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-blush-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images?.[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <span className="line-clamp-1 font-medium text-brand-deep-900">{p.name}</span>
              </td>
              <td className="px-4 py-3 text-brand-deep-900/70">{categoryName(p.category)}</td>
              <td className="px-4 py-3 text-brand-deep-900/70">{money(p.price)}</td>
              <td className="px-4 py-3 text-brand-deep-900/70">{p.stock}</td>
              <td className="px-4 py-3">
                <button
                  disabled={busyId === p.id}
                  onClick={() => toggle(p, "featured")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    p.featured ? "bg-brand-orchid-500 text-white" : "bg-brand-blush-100 text-brand-deep-900/60"
                  }`}
                >
                  {p.featured ? "Sí" : "No"}
                </button>
              </td>
              <td className="px-4 py-3">
                <button
                  disabled={busyId === p.id}
                  onClick={() => toggle(p, "active")}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}
                >
                  {p.active ? "Activo" : "Oculto"}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="rounded-full border border-brand-plum-600/30 px-3 py-1.5 text-xs font-semibold text-brand-plum-700 hover:bg-brand-blush-50"
                  >
                    Editar
                  </Link>
                  <button
                    disabled={busyId === p.id}
                    onClick={() => remove(p)}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <p className="px-4 py-10 text-center text-brand-deep-900/50">
          Aún no tienes productos. ¡Agrega el primero!
        </p>
      )}
    </div>
  );
}
