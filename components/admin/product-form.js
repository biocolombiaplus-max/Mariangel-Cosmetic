"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/image-uploader";
import { parseJsonResponse } from "@/lib/api-client";

const empty = {
  name: "",
  category: "",
  price: "",
  compareAtPrice: "",
  description: "",
  images: [],
  stock: 0,
  featured: false,
  active: true,
};

export default function ProductForm({ product, categories }) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [form, setForm] = useState(product ? { ...empty, ...product } : empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        compareAtPrice: form.compareAtPrice === "" ? null : Number(form.compareAtPrice),
        stock: Number(form.stock) || 0,
      };
      const res = await fetch(isEdit ? `/api/products/${product.id}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await parseJsonResponse(res);
      router.push("/admin/productos");
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
        <ImageUploader
          label="Fotos del producto"
          multiple
          value={form.images}
          onChange={(v) => set("images", v)}
        />
      </div>

      <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Nombre</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Categoría</label>
          <select
            required
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Stock</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Precio (COP)</label>
          <input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">
            Precio antes de descuento (opcional)
          </label>
          <input
            type="number"
            min="0"
            value={form.compareAtPrice ?? ""}
            onChange={(e) => set("compareAtPrice", e.target.value)}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Descripción</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-brand-deep-900">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="h-4 w-4 accent-brand-plum-600"
          />
          Producto destacado (aparece en el inicio)
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-brand-deep-900">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 accent-brand-plum-600"
          />
          Visible en la tienda
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-plum-600 px-7 py-3 text-sm font-semibold text-white hover:bg-brand-plum-700 disabled:opacity-60"
        >
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          className="rounded-full border border-brand-plum-600/30 px-7 py-3 text-sm font-semibold text-brand-plum-700 hover:bg-white"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
