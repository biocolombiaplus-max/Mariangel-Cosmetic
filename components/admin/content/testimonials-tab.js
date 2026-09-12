"use client";

import { useState } from "react";
import SaveBar from "@/components/admin/content/save-bar";
import { useSiteSave } from "@/components/admin/content/use-site-save";

function empty() {
  return { id: `t-${Date.now()}`, name: "", text: "", rating: 5 };
}

export default function TestimonialsTab({ testimonials }) {
  const [items, setItems] = useState(testimonials);
  const { save, saving, saved, error } = useSiteSave();

  function update(i, field, value) {
    setItems((s) => s.map((it, idx) => (idx === i ? { ...it, [field]: value } : it)));
  }

  return (
    <div className="max-w-2xl space-y-4">
      {items.map((t, i) => (
        <div key={t.id} className="space-y-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-deep-900">Testimonio {i + 1}</h3>
            <button
              type="button"
              onClick={() => setItems((s) => s.filter((_, idx) => idx !== i))}
              className="text-xs font-semibold text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
          <input
            value={t.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Nombre de la clienta"
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
          <textarea
            value={t.text}
            onChange={(e) => update(i, "text", e.target.value)}
            placeholder="Comentario"
            rows={2}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
          <select
            value={t.rating}
            onChange={(e) => update(i, "rating", Number(e.target.value))}
            className="rounded-xl border border-brand-pink-200 px-4 py-2 text-sm outline-none focus:border-brand-plum-600"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} estrellas
              </option>
            ))}
          </select>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems((s) => [...s, empty()])}
        className="rounded-full border-2 border-dashed border-brand-pink-200 px-6 py-2.5 text-sm font-semibold text-brand-plum-700 hover:bg-brand-blush-50"
      >
        + Agregar testimonio
      </button>
      <SaveBar
        onSave={() => save({ sections: { testimonials: items } })}
        saving={saving}
        saved={saved}
        error={error}
      />
    </div>
  );
}
