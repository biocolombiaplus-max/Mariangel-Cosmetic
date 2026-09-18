"use client";

import { useState } from "react";
import { mergeVariants, variantLabel } from "@/lib/variants";

export default function ProductVariants({ options, variants, images, basePrice, onChange }) {
  const [enabled, setEnabled] = useState((options || []).length > 0);
  const [draftOptions, setDraftOptions] = useState(
    (options && options.length > 0 ? options : [{ name: "", values: [] }]).map((o) => ({
      name: o.name,
      valuesText: (o.values || []).join(", "),
    }))
  );

  function currentOptions() {
    return draftOptions
      .map((o) => ({
        name: o.name.trim(),
        values: o.valuesText
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((o) => o.name && o.values.length > 0);
  }

  function updateDraft(i, field, value) {
    setDraftOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)));
  }

  function addOption() {
    if (draftOptions.length >= 3) return;
    setDraftOptions((prev) => [...prev, { name: "", valuesText: "" }]);
  }

  function removeOption(i) {
    setDraftOptions((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  function regenerate() {
    const opts = currentOptions();
    onChange({ options: opts, variants: mergeVariants(variants, opts) });
  }

  function updateVariant(id, field, value) {
    onChange({
      options: currentOptions(),
      variants: variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    });
  }

  function toggleEnabled(checked) {
    setEnabled(checked);
    if (!checked) onChange({ options: [], variants: [] });
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-brand-deep-900">Variantes</h3>
          <p className="text-xs text-brand-deep-900/50">
            Color, tamaño y otras opciones — igual que en Shopify.
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm font-medium text-brand-deep-900">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => toggleEnabled(e.target.checked)}
            className="h-4 w-4 accent-brand-plum-600"
          />
          Tiene variantes
        </label>
      </div>

      {enabled && (
        <div className="space-y-4">
          {draftOptions.map((o, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={o.name}
                onChange={(e) => updateDraft(i, "name", e.target.value)}
                placeholder="Nombre (ej. Color)"
                className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600 sm:w-40"
              />
              <input
                value={o.valuesText}
                onChange={(e) => updateDraft(i, "valuesText", e.target.value)}
                placeholder="Valores separados por coma (ej. Rosa, Rojo, Nude)"
                className="w-full flex-1 rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
              />
              {draftOptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            {draftOptions.length < 3 && (
              <button
                type="button"
                onClick={addOption}
                className="rounded-full border-2 border-dashed border-brand-pink-200 px-4 py-2 text-xs font-semibold text-brand-plum-700 hover:bg-brand-blush-50"
              >
                + Agregar opción
              </button>
            )}
            <button
              type="button"
              onClick={regenerate}
              className="rounded-full bg-brand-plum-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-plum-700"
            >
              {variants?.length ? "Actualizar variantes" : "Generar variantes"}
            </button>
          </div>

          {variants?.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-brand-blush-100">
              <table className="w-full min-w-[540px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-blush-100 text-brand-deep-900/60">
                    <th className="px-3 py-2 font-medium">Variante</th>
                    <th className="px-3 py-2 font-medium">Precio (opcional)</th>
                    <th className="px-3 py-2 font-medium">Stock</th>
                    <th className="px-3 py-2 font-medium">Imagen</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} className="border-b border-brand-blush-50 last:border-0">
                      <td className="px-3 py-2 font-medium text-brand-deep-900">
                        {variantLabel(v.values)}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          value={v.price ?? ""}
                          onChange={(e) =>
                            updateVariant(
                              v.id,
                              "price",
                              e.target.value === "" ? null : Number(e.target.value)
                            )
                          }
                          placeholder={String(basePrice || 0)}
                          className="w-28 rounded-lg border border-brand-pink-200 px-2 py-1.5 text-sm outline-none focus:border-brand-plum-600"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) => updateVariant(v.id, "stock", Number(e.target.value))}
                          className="w-20 rounded-lg border border-brand-pink-200 px-2 py-1.5 text-sm outline-none focus:border-brand-plum-600"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={v.image || ""}
                          onChange={(e) => updateVariant(v.id, "image", e.target.value)}
                          className="rounded-lg border border-brand-pink-200 px-2 py-1.5 text-xs outline-none focus:border-brand-plum-600"
                        >
                          <option value="">Imagen principal</option>
                          {(images || []).map((img, i) => (
                            <option key={img + i} value={img}>
                              Foto {i + 1}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
