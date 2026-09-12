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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/tienda?categoria=${c.slug}`}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-brand-deep-900 shadow-sm ring-1 ring-brand-blush-100 transition-colors hover:bg-brand-blush-50 hover:text-brand-plum-700"
          >
            <span>{ICONS[c.slug] || "💜"}</span>
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
