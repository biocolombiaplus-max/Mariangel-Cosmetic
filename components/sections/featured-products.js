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
      <div className="mt-6 text-center sm:hidden">
        <Link href="/tienda" className="text-sm font-semibold text-brand-plum-700 hover:underline">
          Ver todo el catálogo →
        </Link>
      </div>
    </section>
  );
}
