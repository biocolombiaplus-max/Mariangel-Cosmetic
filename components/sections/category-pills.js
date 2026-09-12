import Link from "next/link";

const ICONS = {
  labiales: "💄",
  rostro: "✨",
  ojos: "👁️",
  brochas: "🖌️",
  skincare: "🧴",
  cejas: "🪞",
  sets: "🎁",
};

export default function CategoryPills({ categories = [] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-4 text-center sm:mb-6">
        <span className="font-script text-xl text-brand-orchid-500 sm:text-2xl">Explora</span>
        <h2 className="text-xl font-extrabold text-brand-deep-900 sm:text-2xl">
          Compra por categoría
        </h2>
      </div>

      <div className="relative">
        <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-3 sm:overflow-visible sm:px-0">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/tienda?categoria=${c.slug}`}
              className="flex shrink-0 snap-start items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-brand-deep-900 shadow-sm ring-1 ring-brand-blush-100 transition-colors hover:bg-brand-blush-50 hover:text-brand-plum-700 sm:px-5"
            >
              <span>{ICONS[c.slug] || "💜"}</span>
              {c.name}
            </Link>
          ))}
        </div>
        {/* Fades the last pill on mobile so the row visibly hints more content to scroll to. */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-brand-cream to-transparent sm:hidden" />
      </div>
    </section>
  );
}
