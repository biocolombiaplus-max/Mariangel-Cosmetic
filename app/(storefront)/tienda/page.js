export const dynamic = "force-dynamic";

import { readStore } from "@/lib/store";
import { publicProduct } from "@/lib/products";
import { markupPct } from "@/lib/pricing";
import ShopGrid from "@/components/shop-grid";

export const metadata = {
  title: "Tienda | Mariangel Cosmetic",
  description: "Explora todo el catálogo de maquillaje y skincare de Mariangel Cosmetic.",
};

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const data = await readStore();
  const pct = markupPct(data.settings);

  return (
    <ShopGrid
      products={data.products.map((p) => publicProduct(p, pct))}
      categories={data.categories}
      initialCategory={params?.categoria || ""}
    />
  );
}
