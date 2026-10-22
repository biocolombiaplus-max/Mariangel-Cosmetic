"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/image-uploader";
import SaveBar from "@/components/admin/content/save-bar";
import { useSiteSave } from "@/components/admin/content/use-site-save";

function empty() {
  return { id: `tip-${Date.now()}`, title: "", text: "", image: "", productId: "" };
}

export default function TipsTab({ tips, products = [] }) {
  const [title, setTitle] = useState(tips.title);
  const [items, setItems] = useState(tips.items);
  const { save, saving, saved, error } = useSiteSave();

  function update(i, field, value) {
    setItems((s) => s.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
        <label className="mb-1 block text-sm font-medium text-brand-deep-900">
          Título de la sección
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
        />
      </div>

      <p className="text-sm text-brand-deep-900/60">
        Comparte tips de maquillaje cortos relacionados con tus productos — además de educar,
        invitan a comprar el producto del tip con un botón directo.
      </p>

      {items.map((it, i) => (
        <div
          key={it.id}
          className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-deep-900">Tip {i + 1}</h3>
            <button
              type="button"
              onClick={() => setItems((s) => s.filter((_, idx) => idx !== i))}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
          <div className="flex gap-4">
            <ImageUploader value={it.image} onChange={(v) => update(i, "image", v)} />
            <div className="flex flex-1 flex-col gap-2">
              <input
                value={it.title}
                onChange={(e) => update(i, "title", e.target.value)}
                placeholder="Título del tip, ej. 'Labial que no se corre todo el día'"
                className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
              />
              <textarea
                value={it.text}
                onChange={(e) => update(i, "text", e.target.value)}
                placeholder="Explica el tip en 1-2 frases"
                rows={3}
                className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-deep-900/60">
              Producto relacionado (opcional)
            </label>
            <select
              value={it.productId}
              onChange={(e) => update(i, "productId", e.target.value)}
              className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
            >
              <option value="">Sin producto relacionado</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setItems((s) => [...s, empty()])}
        className="rounded-full border-2 border-dashed border-brand-pink-200 px-6 py-2.5 text-sm font-semibold text-brand-plum-700 hover:bg-brand-blush-50"
      >
        + Agregar tip
      </button>

      <SaveBar
        onSave={() => save({ sections: { tips: { title, items } } })}
        saving={saving}
        saved={saved}
        error={error}
      />
    </div>
  );
}
