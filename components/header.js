"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/brand-logo";
import { useCart } from "@/components/cart-context";

export default function Header({ logoUrl, categories = [] }) {
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/tienda", label: "Tienda" },
    ...categories.slice(0, 4).map((c) => ({ href: `/tienda?categoria=${c.slug}`, label: c.name })),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-brand-blush-100 bg-brand-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0">
          <BrandLogo logoUrl={logoUrl} size="md" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-brand-deep-900/80 transition-colors hover:text-brand-plum-700"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/tienda"
            className="hidden rounded-full bg-brand-plum-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-plum-700 sm:inline-block"
          >
            Comprar ahora
          </a>
          <button
            onClick={open}
            aria-label="Abrir carrito"
            className="relative rounded-full border border-brand-pink-200 p-2.5 text-brand-plum-700 hover:bg-brand-blush-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
              <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6 5 2H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orchid-500 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
            className="rounded-full border border-brand-pink-200 p-2.5 text-brand-plum-700 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-brand-blush-100 bg-brand-cream px-4 py-3 lg:hidden">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-brand-deep-900/80 hover:bg-brand-blush-50"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
