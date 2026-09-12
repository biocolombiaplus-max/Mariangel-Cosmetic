"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/image-uploader";
import SaveBar from "@/components/admin/content/save-bar";
import { useSiteSave } from "@/components/admin/content/use-site-save";

export default function PromoAboutTab({ promo, about }) {
  const [promoMessages, setPromoMessages] = useState((promo.messages || []).join("\n"));
  const [aboutForm, setAboutForm] = useState({
    ...about,
    highlights: (about.highlights || []).join("\n"),
  });
  const { save, saving, saved, error } = useSiteSave();

  function handleSave() {
    save({
      sections: {
        promo: {
          messages: promoMessages
            .split("\n")
            .map((m) => m.trim())
            .filter(Boolean),
        },
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
        <h3 className="text-sm font-semibold text-brand-deep-900">Barra de anuncios</h3>
        <p className="text-xs text-brand-deep-900/50">
          Un mensaje llamativo por línea. Se muestran rotando en una barra de color fuerte arriba
          de la tienda — usa emojis y frases cortas con gatillo (envío gratis, urgencia, prueba
          social).
        </p>
        <textarea
          value={promoMessages}
          onChange={(e) => setPromoMessages(e.target.value)}
          rows={5}
          placeholder={
            "🚚 ¡ENVÍO GRATIS en Cúcuta, Los Patios y Villa del Rosario! Por compras desde $59.000\n🔥 Nuevos ingresos cada semana\n💜 +2.000 pedidos entregados"
          }
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
