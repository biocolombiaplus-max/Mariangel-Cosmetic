import { notFound } from "next/navigation";
import { readStore } from "@/lib/store";
import ProductForm from "@/components/admin/product-form";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const data = await readStore();
  const product = data.products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-deep-900">Editar producto</h1>
      <p className="mt-1 mb-6 text-sm text-brand-deep-900/60">{product.name}</p>
      <ProductForm product={product} categories={data.categories} />
    </div>
  );
}
