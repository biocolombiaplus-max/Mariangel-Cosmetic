"use client";

import { useEffect, useState } from "react";
import { parseJsonResponse } from "@/lib/api-client";

// Modal grid of every photo already uploaded to the store, so a real photo
// whose only link (a product's old `images` field) was lost can be
// reattached with one click instead of hunting down its URL by hand.
export default function PhotoLibraryPicker({ onSelect, onClose }) {
  const [images, setImages] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/photo-library")
      .then(parseJsonResponse)
      .then((json) => {
        if (!cancelled) setImages(json.images || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-brand-blush-100 px-5 py-4">
          <h2 className="text-base font-bold text-brand-deep-900">
            📁 Tus fotos ya subidas — elige una
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-brand-plum-700 hover:bg-brand-blush-50"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && images === null && (
            <p className="text-sm text-brand-deep-900/50">Cargando tus fotos…</p>
          )}
          {!error && images !== null && images.length === 0 && (
            <p className="text-sm text-brand-deep-900/50">
              Todavía no tienes fotos subidas a la tienda.
            </p>
          )}
          {!error && images && images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {images.map((img) => (
                <button
                  key={img.publicId}
                  type="button"
                  onClick={() => onSelect(img.url)}
                  className="group aspect-square overflow-hidden rounded-xl ring-1 ring-brand-blush-100 transition-transform hover:scale-[1.03] hover:ring-2 hover:ring-brand-plum-600"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
