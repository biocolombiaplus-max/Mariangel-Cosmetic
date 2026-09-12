"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/image-uploader";
import SaveBar from "@/components/admin/content/save-bar";
import { useSiteSave } from "@/components/admin/content/use-site-save";

function emptySlide() {
  return {
    id: `hero-${Date.now()}`,
    badge: "",
    title: "",
    subtitle: "",
    ctaText: "Ver catálogo",
    ctaLink: "/tienda",
    image: "",
  };
}

export default function HeroTab({ hero }) {
  const [slides, setSlides] = useState(hero);
  const { save, saving, saved, error } = useSiteSave();

  function update(i, field, value) {
    setSlides((s) => s.map((slide, idx) => (idx === i ? { ...slide, [field]: value } : slide)));
  }

  function addSlide() {
    setSlides((s) => [...s, emptySlide()]);
  }

  function removeSlide(i) {
    setSlides((s) => s.filter((_, idx) => idx !== i));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-brand-deep-900/60">
        Estas son las diapositivas principales del inicio de tu tienda (carrusel).
      </p>
      {slides.map((slide, i) => (
        <div key={slide.id} className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-brand-deep-900">Slide {i + 1}</h3>
            {slides.length > 1 && (
              <button
                type="button"
                onClick={() => removeSlide(i)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Eliminar
              </button>
            )}
          </div>
          <ImageUploader value={slide.image} onChange={(v) => update(i, "image", v)} label="Imagen" />
          <input
            value={slide.badge}
            onChange={(e) => update(i, "badge", e.target.value)}
            placeholder="Etiqueta (ej: Nueva colección ✨)"
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
          <textarea
            value={slide.title}
            onChange={(e) => update(i, "title", e.target.value)}
            placeholder="Título grande (usa un salto de línea para dos líneas)"
            rows={2}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
          <textarea
            value={slide.subtitle}
            onChange={(e) => update(i, "subtitle", e.target.value)}
            placeholder="Subtítulo"
            rows={2}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={slide.ctaText}
              onChange={(e) => update(i, "ctaText", e.target.value)}
              placeholder="Texto del botón"
              className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
            />
            <input
              value={slide.ctaLink}
              onChange={(e) => update(i, "ctaLink", e.target.value)}
              placeholder="Link del botón"
              className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSlide}
        className="rounded-full border-2 border-dashed border-brand-pink-200 px-6 py-2.5 text-sm font-semibold text-brand-plum-700 hover:bg-brand-blush-50"
      >
        + Agregar slide
      </button>

      <SaveBar onSave={() => save({ sections: { hero: slides } })} saving={saving} saved={saved} error={error} />
    </div>
  );
}
