"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/product-card";

export default function ShopGrid({ products, categories, initialCategory = "" }) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("relevance");

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.active);
    if (category) list = list.filter((p) => p.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "featured") list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, category, query, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-script text-2xl text-brand-orchid-500">Todo el catálogo</span>
          <h1 className="text-2xl font-extrabold text-brand-deep-900 sm:text-3xl">
            Tienda Mariangel Cosmetic
          </h1>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full rounded-full border border-brand-pink-200 bg-white px-5 py-2.5 text-sm outline-none focus:border-brand-plum-600 sm:w-64"
        />
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategory("")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            category === ""
              ? "bg-brand-plum-600 text-white"
              : "bg-white text-brand-deep-900 ring-1 ring-brand-blush-100 hover:bg-brand-blush-50"
          }`}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setCategory(c.slug)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === c.slug
                ? "bg-brand-plum-600 text-white"
                : "bg-white text-brand-deep-900 ring-1 ring-brand-blush-100 hover:bg-brand-blush-50"
            }`}
          >
            {c.name}
          </button>
        ))}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-auto rounded-full border border-brand-pink-200 bg-white px-4 py-2 text-sm text-brand-deep-900 outline-none"
        >
          <option value="relevance">Relevancia</option>
          <option value="featured">Destacados primero</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-brand-deep-900/60">
          No encontramos productos con esos filtros. Intenta con otra búsqueda.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
