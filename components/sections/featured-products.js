import Link from "next/link";
import ProductCard from "@/components/product-card";

export default function FeaturedProducts({
  products = [],
  eyebrow = "Lo más amado",
  title = "Productos destacados",
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <span className="font-script text-2xl text-brand-orchid-500">{eyebrow}</span>
          <h2 className="text-2xl font-extrabold text-brand-deep-900 sm:text-3xl">{title}</h2>
        </div>
        <Link
          href="/tienda"
          className="hidden text-sm font-semibold text-brand-plum-700 hover:underline sm:inline"
        >
          Ver todo →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link
          href="/tienda"
          className="brand-gradient inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-bold text-white shadow-lg shadow-brand-plum-700/25 transition-transform hover:scale-[1.03]"
        >
          Ver catálogo completo
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
