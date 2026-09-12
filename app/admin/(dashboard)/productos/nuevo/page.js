import { readStore } from "@/lib/store";
import ProductForm from "@/components/admin/product-form";

export default async function NewProductPage() {
  const data = await readStore();
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-deep-900">Agregar producto</h1>
      <p className="mt-1 mb-6 text-sm text-brand-deep-900/60">
        Completa la información y sube las fotos para que se vea perfecto en tu tienda.
      </p>
      <ProductForm categories={data.categories} />
    </div>
  );
}
