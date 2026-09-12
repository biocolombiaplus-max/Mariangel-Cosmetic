"use client";

import { useRef, useState } from "react";
import { parseJsonResponse } from "@/lib/api-client";

// Uploads to /api/upload and reports back the resulting URL(s).
// Works both for a single image field (value: string) and a list (value: array).
export default function ImageUploader({ value, onChange, multiple = false, label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const urls = multiple ? value || [] : value ? [value] : [];

  async function handleFiles(files) {
    setError("");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = await parseJsonResponse(res);
        uploaded.push(json.url);
      }
      if (multiple) {
        onChange([...(value || []), ...uploaded]);
      } else {
        onChange(uploaded[0]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(i) {
    if (multiple) {
      const next = [...(value || [])];
      next.splice(i, 1);
      onChange(next);
    } else {
      onChange("");
    }
  }

  return (
    <div>
      {label && <p className="mb-2 text-sm font-medium text-brand-deep-900">{label}</p>}
      <div className="flex flex-wrap gap-3">
        {urls.map((u, i) => (
          <div key={u + i} className="group relative h-24 w-24 overflow-hidden rounded-xl ring-1 ring-brand-blush-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white group-hover:flex"
            >
              ✕
            </button>
          </div>
        ))}
        {(multiple || urls.length === 0) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand-pink-200 text-brand-plum-700 hover:bg-brand-blush-50"
          >
            <span className="text-xl">{uploading ? "…" : "+"}</span>
            <span className="text-[10px]">{uploading ? "Subiendo" : "Subir"}</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        multiple={multiple}
        hidden
        onChange={(e) => e.target.files?.length && handleFiles(Array.from(e.target.files))}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
