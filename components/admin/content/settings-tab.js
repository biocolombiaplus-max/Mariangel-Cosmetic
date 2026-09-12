"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/image-uploader";
import SaveBar from "@/components/admin/content/save-bar";
import { useSiteSave } from "@/components/admin/content/use-site-save";

export default function SettingsTab({ settings }) {
  const [form, setForm] = useState(settings);
  const { save, saving, saved, error } = useSiteSave();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
        <ImageUploader
          label="Logo de la tienda"
          value={form.logo}
          onChange={(v) => setForm((f) => ({ ...f, logo: v }))}
        />
        <p className="mt-2 text-xs text-brand-deep-900/50">
          Si no subes un logo, se usará el logo por defecto generado para Mariangel Cosmetic.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Nombre de la tienda</label>
          <input
            value={form.storeName}
            onChange={set("storeName")}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">
            WhatsApp Business (con código de país, sin espacios ni +)
          </label>
          <input
            value={form.whatsapp}
            onChange={set("whatsapp")}
            placeholder="573005089954"
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Usuario de Instagram</label>
          <input
            value={form.instagramHandle}
            onChange={set("instagramHandle")}
            placeholder="@mariangelcosmetic"
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Link de Instagram</label>
          <input
            value={form.instagramUrl}
            onChange={set("instagramUrl")}
            placeholder="https://instagram.com/mariangelcosmetic"
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>
      </div>

      <SaveBar onSave={() => save({ settings: form })} saving={saving} saved={saved} error={error} />
    </div>
  );
}
