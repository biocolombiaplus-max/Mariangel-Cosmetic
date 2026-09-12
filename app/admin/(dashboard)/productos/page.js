import Link from "next/link";
import { readStore } from "@/lib/store";
import ProductsTable from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  const data = await readStore();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-deep-900">Productos</h1>
          <p className="mt-1 text-sm text-brand-deep-900/60">
            {data.products.length} productos en tu catálogo
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-brand-plum-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-plum-700"
        >
          + Agregar producto
        </Link>
      </div>

      <div className="mt-6">
        <ProductsTable initialProducts={data.products} categories={data.categories} />
      </div>
    </div>
  );
}
