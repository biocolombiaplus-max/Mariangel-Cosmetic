"use client";

import { useState } from "react";
import SaveBar from "@/components/admin/content/save-bar";
import { useSiteSave } from "@/components/admin/content/use-site-save";

export default function FooterTab({ footer }) {
  const [form, setForm] = useState(footer);
  const { save, saving, saved, error } = useSiteSave();
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Descripción</label>
          <textarea
            value={form.description}
            onChange={set("description")}
            rows={3}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Horario de atención</label>
          <input
            value={form.schedule}
            onChange={set("schedule")}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Ciudad / cobertura</label>
          <input
            value={form.city}
            onChange={set("city")}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-deep-900">Correo de contacto</label>
          <input
            value={form.email}
            onChange={set("email")}
            className="w-full rounded-xl border border-brand-pink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-plum-600"
          />
        </div>
      </div>
      <SaveBar
        onSave={() => save({ sections: { footer: form } })}
        saving={saving}
        saved={saved}
        error={error}
      />
    </div>
  );
}
