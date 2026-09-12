"use client";

export default function SaveBar({ onSave, saving, saved, error }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-full bg-brand-plum-600 px-7 py-2.5 text-sm font-semibold text-white hover:bg-brand-plum-700 disabled:opacity-60"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
      {saved && <span className="text-sm text-green-700">✔ Guardado</span>}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
