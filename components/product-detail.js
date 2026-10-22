"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import { useCart } from "@/components/cart-context";
import CheckoutModal from "@/components/checkout-modal";
import StarRating from "@/components/star-rating";
import { findVariant, variantLabel } from "@/lib/variants";
import { swatchColorFor } from "@/lib/colors";
import { trackPixelEvent } from "@/lib/meta-pixel-events";
import { trackFunnelEvent } from "@/lib/track-event";

export default function ProductDetail({ product, whatsapp, storeName, freeShippingThreshold }) {
  const { addItem } = useCart();
  const hasVariants = product.options?.length > 0;

  useEffect(() => {
    trackPixelEvent("ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "COP",
    });
    trackFunnelEvent("view_product");
    // Only once per page load — not on every variant selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const [selected, setSelected] = useState(() =>
    hasVariants && product.variants?.[0] ? { ...product.variants[0].values } : {}
  );
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const selectedVariant = hasVariants ? findVariant(product.variants, selected) : null;
  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveBasePrice = selectedVariant?.basePrice ?? product.basePrice ?? product.price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > effectivePrice;
  const canOrder = (!hasVariants || Boolean(selectedVariant)) && effectiveStock > 0;
  const discountPct = hasDiscount
    ? Math.round(100 - (effectivePrice / product.compareAtPrice) * 100)
    : 0;

  // When every value of the single option has its own photo configured in
  // the admin, show real thumbnail swatches instead of plain text pills —
  // the "pick by photo" pattern shoppers expect from premium stores.
  const singleOption = product.options.length === 1 ? product.options[0] : null;
  const thumbsByValue = singleOption
    ? Object.fromEntries(
        (product.variants || [])
          .filter((v) => v.image)
          .map((v) => [v.values[singleOption.name], v.image])
      )
    : {};
  const useImageSwatches = singleOption && Object.keys(thumbsByValue).length === product.variants.length;

  const variantSuffix = selectedVariant ? ` (${variantLabel(selectedVariant.values)})` : "";
  const cartProduct = {
    id: selectedVariant ? `${product.id}::${selectedVariant.id}` : product.id,
    slug: product.slug,
    name: `${product.name}${variantSuffix}`,
    price: effectivePrice,
    basePrice: effectiveBasePrice,
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
        <div className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-3xl bg-brand-blush-50 shadow-sm ring-1 ring-brand-blush-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[activeImg]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {hasDiscount && (
            <span className="absolute left-4 top-4 rounded-full bg-brand-plum-700 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
              -{discountPct}%
            </span>
          )}
          {product.featured && (
            <span className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-plum-700 shadow-sm">
              ✨ Top
            </span>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2.5">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 transition-all ${
                  i === activeImg
                    ? "ring-brand-plum-600"
                    : "ring-brand-blush-100 hover:ring-brand-pink-300"
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
        {product.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-blush-100 px-3 py-1 text-xs font-semibold text-brand-plum-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1 className="mt-2 text-3xl font-extrabold text-brand-deep-900">{product.name}</h1>
        <p className="mt-4 leading-relaxed text-brand-deep-900/70">{product.description}</p>

        <div className="mt-6 space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-brand-blush-100">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-brand-plum-700">
              {money(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-brand-plum-700/50 line-through">
                {money(product.compareAtPrice)}
              </span>
            )}
          </div>

          {hasVariants && (
            <div className="space-y-5">
              {product.options.map((opt) => (
                <div key={opt.name}>
                  <p className="mb-2 text-sm font-semibold text-brand-deep-900">
                    {opt.name}
                    {selected[opt.name] && (
                      <span className="font-normal text-brand-deep-900/60"> · {selected[opt.name]}</span>
                    )}
                  </p>

                  {useImageSwatches && opt.name === singleOption.name ? (
                    <div className="flex flex-wrap gap-3">
                      {opt.values.map((val) => {
                        const isSelected = selected[opt.name] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => selectOptionValue(opt.name, val)}
                            title={val}
                            className="flex flex-col items-center gap-1.5"
                          >
                            <span
                              className={`block h-16 w-16 overflow-hidden rounded-2xl ring-2 transition-all ${
                                isSelected
                                  ? "ring-brand-plum-600"
                                  : "ring-brand-blush-100 hover:ring-brand-pink-300"
                              }`}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumbsByValue[val]}
                                alt={val}
                                className="h-full w-full object-cover"
                              />
                            </span>
                            <span
                              className={`max-w-[4.5rem] truncate text-[11px] font-medium ${
                                isSelected ? "text-brand-plum-700" : "text-brand-deep-900/60"
                              }`}
                            >
                              {val}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        const isSelected = selected[opt.name] === val;
                        const swatch = swatchColorFor(val);
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => selectOptionValue(opt.name, val)}
                            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                              isSelected
                                ? "border-brand-plum-600 bg-brand-plum-600 text-white shadow-sm shadow-brand-plum-600/30"
                                : "border-brand-pink-200 text-brand-deep-900 hover:border-brand-pink-300 hover:bg-brand-blush-50"
                            }`}
                          >
                            {swatch && (
                              <span
                                className={`h-3 w-3 shrink-0 rounded-full ring-1 ${
                                  isSelected ? "ring-white/60" : "ring-black/10"
                                }`}
                                style={{ backgroundColor: swatch }}
                              />
                            )}
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {!selectedVariant && (
                <p className="text-xs text-red-600">Esta combinación no está disponible.</p>
              )}
            </div>
          )}

          <p className="text-sm">
            {effectiveStock > 0 ? (
              <span className="text-green-700">✔ Disponible ({effectiveStock} en stock)</span>
            ) : (
              <span className="text-red-600">Agotado por ahora</span>
            )}
            {product.sku && <span className="ml-3 text-brand-deep-900/40">SKU: {product.sku}</span>}
          </p>

          <div className="flex items-center gap-3">
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
                trackPixelEvent("AddToCart", {
                  content_ids: [product.id],
                  content_name: cartProduct.name,
                  content_type: "product",
                  value: effectivePrice * qty,
                  currency: "COP",
                });
                trackFunnelEvent("add_to_cart");
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
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-60"
          >
            Comprar ya por WhatsApp
          </button>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-brand-blush-100 pt-4 text-[11px] font-medium text-brand-deep-900/50">
            <span>🚚 Envío a toda Colombia</span>
            <span>🔒 Compra segura</span>
            <span>💬 Asesoría por WhatsApp</span>
          </div>
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        whatsapp={whatsapp}
        storeName={storeName}
        items={[
          {
            id: cartProduct.id,
            name: cartProduct.name,
            price: effectivePrice,
            basePrice: effectiveBasePrice,
            image: cartProduct.images[0],
            qty,
          },
        ]}
        total={buyNowTotal}
        freeShippingThreshold={freeShippingThreshold}
      />
    </div>
  );
}
