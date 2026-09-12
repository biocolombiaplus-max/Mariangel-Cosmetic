"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/image-uploader";
import SaveBar from "@/components/admin/content/save-bar";
import { useSiteSave } from "@/components/admin/content/use-site-save";

export default function PromoAboutTab({ promo, about }) {
  const [promoForm, setPromoForm] = useState(promo);
  const [aboutForm, setAboutForm] = useState({
    ...about,
    highlights: (about.highlights || []).join("\n"),
  });
  const { save, saving, saved, error } = useSiteSave();

  function handleSave() {
    save({
      sections: {
        promo: promoForm,
        about: {
          ...aboutForm,
          highlights: aboutForm.highlights.split("\n").map((h) => h.trim()).filter(Boolean),
        },
      },
    });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
        <h3 className="text-sm font-semibold text-brand-deep-900">Barra de promoción</h3>
        <ImageUploader
          value={promoForm.image}
          onChange={(v) => setPromoForm((f) => ({ ...f, image: v }))}
          label="Imagen de fondo (opcional)"
        />
        <input
          value={promoForm.text}
          onChange={(e) => setPromoForm((f) => ({ ...f, text: e.target.value }))}
          placeholder="Texto de la promoción"
          className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
        />
      </div>

      <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
        <h3 className="text-sm font-semibold text-brand-deep-900">Sección &quot;Sobre nosotros&quot;</h3>
        <ImageUploader
          value={aboutForm.image}
          onChange={(v) => setAboutForm((f) => ({ ...f, image: v }))}
          label="Imagen"
        />
        <input
          value={aboutForm.title}
          onChange={(e) => setAboutForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Título"
          className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
        />
        <textarea
          value={aboutForm.text}
          onChange={(e) => setAboutForm((f) => ({ ...f, text: e.target.value }))}
          placeholder="Texto"
          rows={4}
          className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
        />
        <textarea
          value={aboutForm.highlights}
          onChange={(e) => setAboutForm((f) => ({ ...f, highlights: e.target.value }))}
          placeholder={"Puntos destacados, uno por línea"}
          rows={3}
          className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
        />
      </div>

      <SaveBar onSave={handleSave} saving={saving} saved={saved} error={error} />
    </div>
  );
}
