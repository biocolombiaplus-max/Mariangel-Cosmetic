"use client";

import { useState } from "react";
import { money } from "@/lib/format";
import { useCart } from "@/components/cart-context";
import CheckoutModal from "@/components/checkout-modal";
import StarRating from "@/components/star-rating";
import { findVariant, variantLabel } from "@/lib/variants";

export default function ProductDetail({ product, whatsapp, storeName }) {
  const { addItem } = useCart();
  const hasVariants = product.options?.length > 0;

  const [selected, setSelected] = useState(() =>
    hasVariants && product.variants?.[0] ? { ...product.variants[0].values } : {}
  );
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const selectedVariant = hasVariants ? findVariant(product.variants, selected) : null;
  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > effectivePrice;
  const canOrder = (!hasVariants || Boolean(selectedVariant)) && effectiveStock > 0;

  const variantSuffix = selectedVariant ? ` (${variantLabel(selectedVariant.values)})` : "";
  const cartProduct = {
    id: selectedVariant ? `${product.id}::${selectedVariant.id}` : product.id,
    slug: product.slug,
    name: `${product.name}${variantSuffix}`,
    price: effectivePrice,
    images: [selectedVariant?.image || product.images[activeImg]],
  };
  const buyNowTotal = effectivePrice * qty;

  function selectOptionValue(optionName, value) {
    const nextSelected = { ...selected, [optionName]: value };
    setSelected(nextSelected);
    setQty(1);
    const variant = findVariant(product.variants, nextSelected);
    if (variant?.image) {
      const idx = product.images.indexOf(variant.image);
      if (idx !== -1) setActiveImg(idx);
    }
  }

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
          <span className="text-2xl font-bold text-brand-plum-700">{money(effectivePrice)}</span>
          {hasDiscount && (
            <span className="text-base text-brand-plum-700/50 line-through">
              {money(product.compareAtPrice)}
            </span>
          )}
        </div>
        <p className="mt-5 leading-relaxed text-brand-deep-900/70">{product.description}</p>

        {hasVariants && (
          <div className="mt-5 space-y-4">
            {product.options.map((opt) => (
              <div key={opt.name}>
                <p className="mb-1.5 text-sm font-semibold text-brand-deep-900">
                  {opt.name}
                  {selected[opt.name] && (
                    <span className="font-normal text-brand-deep-900/60"> · {selected[opt.name]}</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => selectOptionValue(opt.name, val)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                        selected[opt.name] === val
                          ? "border-brand-plum-600 bg-brand-plum-600 text-white"
                          : "border-brand-pink-200 text-brand-deep-900 hover:bg-brand-blush-50"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!selectedVariant && (
              <p className="text-xs text-red-600">Esta combinación no está disponible.</p>
            )}
          </div>
        )}

        <p className="mt-4 text-sm">
          {effectiveStock > 0 ? (
            <span className="text-green-700">✔ Disponible ({effectiveStock} en stock)</span>
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
              addItem(cartProduct, qty);
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
            disabled={!canOrder}
            className="flex-1 rounded-full bg-brand-plum-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-plum-700 disabled:bg-brand-pink-200"
          >
            {added ? "¡Agregado! 🛍️" : "Agregar al carrito"}
          </button>
        </div>

        <button
          onClick={() => setCheckoutOpen(true)}
          disabled={!canOrder}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
        >
          Comprar ya por WhatsApp
        </button>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        whatsapp={whatsapp}
        storeName={storeName}
        items={[{ id: cartProduct.id, name: cartProduct.name, price: effectivePrice, qty }]}
        total={buyNowTotal}
      />
    </div>
  );
}
