"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Hero({ slides = [] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setActive((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="relative overflow-hidden brand-gradient-soft">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`${i === active ? "relative opacity-100" : "hidden opacity-0"} `}
        >
          <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:py-16">
            <div className="order-2 md:order-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-plum-700 shadow-sm">
                {slide.badge}
              </span>
              <h1 className="mt-4 whitespace-pre-line text-4xl font-extrabold leading-[1.08] text-brand-deep-900 sm:text-5xl lg:text-6xl">
                {slide.title}
              </h1>
              <p className="mt-4 max-w-md text-base text-brand-deep-900/70 sm:text-lg">
                {slide.subtitle}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={slide.ctaLink || "/tienda"}
                  className="rounded-full bg-brand-plum-600 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-brand-plum-600/30 transition-colors hover:bg-brand-plum-700"
                >
                  {slide.ctaText || "Ver catálogo"}
                </Link>
                <Link
                  href="/tienda"
                  className="rounded-full border border-brand-plum-600/30 px-7 py-3 text-sm font-semibold text-brand-plum-700 hover:bg-white"
                >
                  Explorar tienda
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative mx-auto aspect-[4/3.4] w-full max-w-md overflow-hidden rounded-[2.5rem] shadow-2xl shadow-brand-plum-700/20 sm:aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image}
                  alt={slide.title?.replace("\n", " ")}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-6">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              aria-label={`Ver slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === active ? "w-6 bg-brand-plum-600" : "w-2 bg-brand-pink-200"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
