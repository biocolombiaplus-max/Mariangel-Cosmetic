"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/image-uploader";
import SaveBar from "@/components/admin/content/save-bar";
import { useSiteSave } from "@/components/admin/content/use-site-save";

export default function InstagramTab({ instagram }) {
  const [form, setForm] = useState(instagram);
  const { save, saving, saved, error } = useSiteSave();

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Título de la sección</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Usuario mostrado</label>
          <input
            value={form.handle}
            onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>
        <ImageUploader
          label="Galería de imágenes (estilo feed de Instagram)"
          multiple
          value={form.images}
          onChange={(v) => setForm((f) => ({ ...f, images: v }))}
        />
      </div>
      <SaveBar
        onSave={() => save({ sections: { instagram: form } })}
        saving={saving}
        saved={saved}
        error={error}
      />
    </div>
  );
}
