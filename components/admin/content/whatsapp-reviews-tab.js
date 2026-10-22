"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/image-uploader";
import SaveBar from "@/components/admin/content/save-bar";
import { useSiteSave } from "@/components/admin/content/use-site-save";

function empty() {
  return { id: `wr-${Date.now()}`, image: "", customerName: "" };
}

export default function WhatsappReviewsTab({ whatsappReviews }) {
  const [title, setTitle] = useState(whatsappReviews.title);
  const [items, setItems] = useState(whatsappReviews.items);
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
        Sube capturas de pantalla reales de tus conversaciones de WhatsApp con clientas (recorta la
        parte donde se vea su mensaje de agradecimiento o su pedido). Esto genera mucha más
        confianza que un testimonio escrito.
      </p>

      {items.map((it, i) => (
        <div
          key={it.id}
          className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100"
        >
          <ImageUploader value={it.image} onChange={(v) => update(i, "image", v)} />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-brand-deep-900">Captura {i + 1}</h3>
              <button
                type="button"
                onClick={() => setItems((s) => s.filter((_, idx) => idx !== i))}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Eliminar
              </button>
            </div>
            <input
              value={it.customerName}
              onChange={(e) => update(i, "customerName", e.target.value)}
              placeholder="Nombre de la clienta (opcional)"
              className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setItems((s) => [...s, empty()])}
        className="rounded-full border-2 border-dashed border-brand-pink-200 px-6 py-2.5 text-sm font-semibold text-brand-plum-700 hover:bg-brand-blush-50"
      >
        + Agregar captura de WhatsApp
      </button>

      <SaveBar
        onSave={() => save({ sections: { whatsappReviews: { title, items } } })}
        saving={saving}
        saved={saved}
        error={error}
      />
    </div>
  );
}
