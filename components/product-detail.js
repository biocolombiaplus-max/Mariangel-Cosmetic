"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import { useCart } from "@/components/cart-context";
import { waLink, buildProductMessage } from "@/lib/whatsapp";
import StarRating from "@/components/star-rating";

export default function ProductDetail({ product, whatsapp, storeName }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const buyNowHref = waLink(whatsapp, buildProductMessage(storeName, product));

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2">
      <div>
        <div className="aspect-square overflow-hidden rounded-3xl bg-brand-blush-50 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[activeImg]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setActiveImg(i)}
                className={`h-16 w-16 overflow-hidden rounded-xl ring-2 ${
                  i === activeImg ? "ring-brand-plum-600" : "ring-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <StarRating rating={product.rating} />
        <h1 className="mt-2 text-3xl font-extrabold text-brand-deep-900">{product.name}</h1>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-brand-plum-700">{money(product.price)}</span>
          {hasDiscount && (
            <span className="text-base text-brand-plum-700/50 line-through">
              {money(product.compareAtPrice)}
            </span>
          )}
        </div>
        <p className="mt-5 leading-relaxed text-brand-deep-900/70">{product.description}</p>

        <p className="mt-4 text-sm">
          {product.stock > 0 ? (
            <span className="text-green-700">✔ Disponible ({product.stock} en stock)</span>
          ) : (
            <span className="text-red-600">Agotado por ahora</span>
          )}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-full border border-brand-pink-200">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-4 py-2 text-brand-plum-700"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2 text-brand-plum-700">
              +
            </button>
          </div>

          <button
            onClick={() => {
              addItem(product, qty);
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
            disabled={product.stock <= 0}
            className="flex-1 rounded-full bg-brand-plum-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-plum-700 disabled:bg-brand-pink-200"
          >
            {added ? "¡Agregado! 🛍️" : "Agregar al carrito"}
          </button>
        </div>

        <a
          href={buyNowHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-sm hover:brightness-95"
        >
          Comprar ya por WhatsApp
        </a>
      </div>
    </div>
  );
}
