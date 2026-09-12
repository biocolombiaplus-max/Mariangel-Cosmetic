export const dynamic = "force-dynamic";

import { readStore } from "@/lib/store";
import { publicProduct } from "@/lib/products";
import ShopGrid from "@/components/shop-grid";

export const metadata = {
  title: "Tienda | Mariangel Cosmetic",
  description: "Explora todo el catálogo de maquillaje y skincare de Mariangel Cosmetic.",
};

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const data = await readStore();

  return (
    <ShopGrid
      products={data.products.map(publicProduct)}
      categories={data.categories}
      initialCategory={params?.categoria || ""}
    />
  );
}
