"use client";

import Link from "next/link";
import { money } from "@/lib/format";
import { useCart } from "@/components/cart-context";
import StarRating from "@/components/star-rating";
import { priceRange } from "@/lib/variants";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const hasVariants = product.options?.length > 0;
  const range = hasVariants ? priceRange(product) : null;
  const displayPrice = range ? range.min : product.price;
  const hasDiscount = !hasVariants && product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-brand-blush-100 transition-shadow hover:shadow-lg">
      <Link href={`/producto/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-brand-blush-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-plum-700 px-2.5 py-1 text-[11px] font-bold text-white">
            -{discountPct}%
          </span>
        )}
        {product.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-plum-700">
            ✨ Top
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <StarRating rating={product.rating} />
        <Link href={`/producto/${product.slug}`}>
          <h3 className="text-sm font-semibold text-brand-deep-900 line-clamp-1 hover:text-brand-plum-700">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-brand-plum-700">
            {range && range.min !== range.max ? `Desde ${money(range.min)}` : money(displayPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-brand-plum-700/50 line-through">
              {money(product.compareAtPrice)}
            </span>
          )}
        </div>

        {hasVariants ? (
          <Link
            href={`/producto/${product.slug}`}
            className="mt-2 w-full rounded-full bg-brand-plum-600 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-plum-700"
          >
            Ver opciones
          </Link>
        ) : (
          <button
            onClick={() => addItem(product, 1)}
            disabled={product.stock <= 0}
            className="mt-2 w-full rounded-full bg-brand-plum-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-plum-700 disabled:cursor-not-allowed disabled:bg-brand-pink-200"
          >
            {product.stock > 0 ? "Agregar al carrito" : "Agotado"}
          </button>
        )}
      </div>
    </div>
  );
}
