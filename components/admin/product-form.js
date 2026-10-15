"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/image-uploader";
import ProductVariants from "@/components/admin/product-variants";
import { parseJsonResponse } from "@/lib/api-client";
import { money } from "@/lib/format";
import { applyMarkup, DEFAULT_MARKUP_PCT } from "@/lib/pricing";

const empty = {
  name: "",
  category: "",
  price: "",
  compareAtPrice: "",
  cost: "",
  description: "",
  images: [],
  stock: 0,
  sku: "",
  tags: [],
  seoTitle: "",
  seoDescription: "",
  options: [],
  variants: [],
  featured: false,
  active: true,
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-deep-900">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-brand-deep-900/50">{hint}</p>}
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600";

export default function ProductForm({ product, categories, marginPct = DEFAULT_MARKUP_PCT }) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [form, setForm] = useState(
    product
      ? { ...empty, ...product, tags: (product.tags || []).join(", ") }
      : { ...empty, tags: "" }
  );
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
        cost: Number(form.cost) || 0,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
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

  const categoryName = categories.find((c) => c.slug === form.category)?.name;
  const margin =
    Number(form.price) > 0 && form.cost !== ""
      ? Math.round(((Number(form.price) - Number(form.cost)) / Number(form.price)) * 100)
      : null;
  const finalPrice = Number(form.price) > 0 ? applyMarkup(Number(form.price), marginPct) : 0;
  const biomarketingCut = finalPrice - Number(form.price || 0);

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <h2 className="mb-1 text-sm font-bold text-brand-deep-900">📸 Fotos del producto</h2>
          <p className="mb-3 text-xs text-brand-deep-900/50">
            Sube de 2 a 5 fotos en buena calidad — ideal cuadradas, mínimo 800×800px, con luz
            natural y fondo claro. La <strong>primera foto</strong> es la que se ve en la tienda y
            en las redes; las demás aparecen como miniaturas en la página del producto.
          </p>
          <ImageUploader multiple value={form.images} onChange={(v) => set("images", v)} />
        </div>

        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <h2 className="text-sm font-bold text-brand-deep-900">🏷️ Título y descripción</h2>

          <Field
            label="Nombre del producto"
            hint="Aparece como título en la tienda, en las tarjetas de producto y en Google. Sé claro y específico, ej. 'Labial Mate Rose'."
          >
            <input
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field
            label="Descripción"
            hint="Explica qué es, para qué sirve y qué lo hace especial. Aparece debajo del precio en la página del producto."
          >
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <h2 className="text-sm font-bold text-brand-deep-900">💰 Precios</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Tu precio (COP)"
              hint="El precio que tú defines para tu ganancia. En la tienda se muestra un poco más alto para cubrir la comisión de Biomarketing (ver abajo) — tú nunca pierdes margen por eso."
            >
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field
              label="Precio antes de descuento"
              hint="Opcional. Actívalo solo si está en oferta — se muestra tachado junto al precio."
            >
              <input
                type="number"
                min="0"
                value={form.compareAtPrice ?? ""}
                onChange={(e) => set("compareAtPrice", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          {finalPrice > 0 && (
            <div className="rounded-xl bg-brand-blush-50/60 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-brand-deep-900/60">Tu precio</span>
                <span className="font-medium text-brand-deep-900">{money(Number(form.price))}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-brand-deep-900/60">
                  + Comisión Biomarketing ({marginPct}%)
                </span>
                <span className="font-medium text-brand-orchid-500">+{money(biomarketingCut)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-brand-blush-100 pt-2">
                <span className="font-semibold text-brand-deep-900">Precio final en la tienda</span>
                <span className="text-base font-bold text-brand-plum-700">{money(finalPrice)}</span>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-dashed border-brand-orchid-400/50 bg-brand-blush-50/60 p-4">
            <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-brand-deep-900">
              🔒 Costo interno (COP)
            </p>
            <p className="mb-2 text-xs text-brand-deep-900/50">
              Solo tú lo ves en el panel — nunca se muestra a tus clientes. Se usa para calcular tu
              ganancia real, aparte de la comisión de Biomarketing.
            </p>
            <input
              type="number"
              min="0"
              value={form.cost}
              onChange={(e) => set("cost", e.target.value)}
              placeholder="0"
              className={`${inputClass} max-w-xs bg-white`}
            />
            {margin !== null && (
              <p className="mt-2 text-xs font-medium text-brand-plum-700">
                Tu ganancia por unidad: {money(Number(form.price) - Number(form.cost))} ({margin}%
                margen) — esto es solo tuyo, no incluye la comisión de Biomarketing.
              </p>
            )}
          </div>
        </div>

        <ProductVariants
          options={form.options}
          variants={form.variants}
          images={form.images}
          basePrice={form.price}
          onChange={({ options, variants }) => setForm((f) => ({ ...f, options, variants }))}
        />

        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <div>
            <h2 className="text-sm font-bold text-brand-deep-900">🔍 Motor de búsqueda (SEO)</h2>
            <p className="text-xs text-brand-deep-900/50">
              Así se ve tu producto cuando alguien lo busca en Google. Déjalo vacío para usar el
              nombre y la descripción automáticamente.
            </p>
          </div>

          <div className="rounded-xl border border-brand-blush-100 bg-white p-3">
            <p className="truncate text-sm text-[#1a0dab]">
              {form.seoTitle || form.name || "Nombre del producto"} | Mariangel Cosmetic
            </p>
            <p className="text-xs text-green-700">mariangel-cosmetic.vercel.app › producto</p>
            <p className="line-clamp-2 text-xs text-brand-deep-900/60">
              {form.seoDescription || form.description || "La descripción aparecerá aquí."}
            </p>
          </div>

          <Field label="Título SEO (opcional)">
            <input
              value={form.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              placeholder={form.name}
              maxLength={70}
              className={inputClass}
            />
          </Field>

          <Field label="Descripción SEO (opcional)" hint="Ideal entre 120 y 160 caracteres.">
            <textarea
              rows={2}
              value={form.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
              placeholder={form.description}
              maxLength={160}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <h2 className="mb-3 text-sm font-bold text-brand-deep-900">✅ Estado</h2>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-deep-900">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set("active", e.target.checked)}
              className="h-4 w-4 accent-brand-plum-600"
            />
            Visible en la tienda
          </label>
          <p className="mb-3 text-xs text-brand-deep-900/50">
            Si lo desactivas, el producto queda guardado pero oculto para tus clientas.
          </p>
          <label className="flex items-center gap-2 text-sm font-medium text-brand-deep-900">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 accent-brand-plum-600"
            />
            Producto destacado
          </label>
          <p className="text-xs text-brand-deep-900/50">Aparece en la sección &ldquo;Lo más amado&rdquo; del inicio.</p>
        </div>

        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <h2 className="text-sm font-bold text-brand-deep-900">📦 Inventario</h2>

          <Field
            label="Stock"
            hint="Cuando llega a 0, el producto se muestra como 'Agotado' en la tienda."
          >
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="SKU (opcional)" hint="Código interno de inventario — no se muestra a tus clientas.">
            <input
              value={form.sku}
              onChange={(e) => set("sku", e.target.value)}
              placeholder="Ej. LAB-ROSE-01"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <h2 className="text-sm font-bold text-brand-deep-900">🗂️ Organización</h2>

          <Field label="Categoría">
            <select
              required
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass}
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
            {categoryName && (
              <p className="mt-1 text-xs text-brand-deep-900/40">
                Aparecerá en /tienda bajo &ldquo;{categoryName}&rdquo;.
              </p>
            )}
          </Field>

          <Field
            label="Etiquetas (opcional)"
            hint="Se muestran como insignias en la página del producto. Sepáralas con coma — ej. Nuevo, Bestseller, Vegano."
          >
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="Nuevo, Bestseller"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {error && (
        <p className="lg:col-span-3 text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-3 lg:col-span-3">
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
