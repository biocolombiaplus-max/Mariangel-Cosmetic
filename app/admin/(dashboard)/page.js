import Link from "next/link";
import { readStore, money } from "@/lib/store";

export default async function AdminHomePage() {
  const data = await readStore();
  const { products } = data;

  const stats = [
    { label: "Productos activos", value: products.filter((p) => p.active).length, icon: "🛍️" },
    { label: "Destacados", value: products.filter((p) => p.featured).length, icon: "✨" },
    { label: "Agotados", value: products.filter((p) => p.stock <= 0).length, icon: "⚠️" },
    {
      label: "Valor catálogo",
      value: money(products.reduce((s, p) => s + p.price * p.stock, 0)),
      icon: "💰",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-deep-900">Hola, bienvenida 👋</h1>
      <p className="mt-1 text-brand-deep-900/60">
        Gestiona tus productos y el contenido visual de tu tienda desde aquí.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blush-100">
            <span className="text-2xl">{s.icon}</span>
            <p className="mt-2 text-xl font-bold text-brand-deep-900">{s.value}</p>
            <p className="text-xs text-brand-deep-900/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-brand-plum-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-plum-700"
        >
          + Agregar producto
        </Link>
        <Link
          href="/admin/contenido"
          className="rounded-full border border-brand-plum-600/30 px-6 py-3 text-sm font-semibold text-brand-plum-700 hover:bg-white"
        >
          🎨 Editar contenido de la landing
        </Link>
      </div>
    </div>
  );
}
