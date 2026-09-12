"use client";

import { useEffect, useState } from "react";

export default function PromoBanner({ messages = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4200);
    return () => clearInterval(id);
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <section className="promo-shimmer relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-6 py-3 sm:py-3.5">
        <div className="relative flex min-h-[2.75rem] items-center justify-center sm:min-h-[1.75rem]">
          {messages.map((m, i) => (
            <p
              key={i}
              className={`absolute inset-0 flex items-center justify-center px-2 text-center text-[13px] font-bold uppercase leading-snug tracking-wide text-white transition-opacity duration-700 sm:text-sm ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            >
              {m}
            </p>
          ))}
        </div>
        {messages.length > 1 && (
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            {messages.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? "w-4 bg-white" : "w-1 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
