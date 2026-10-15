export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { readStore } from "@/lib/store";
import { publicProduct } from "@/lib/products";
import { markupPct } from "@/lib/pricing";
import ProductDetail from "@/components/product-detail";
import FeaturedProducts from "@/components/sections/featured-products";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await readStore();
  const product = data.products.find((p) => p.slug === slug);
  if (!product) return {};
  const title = product.seoTitle || `${product.name} | Mariangel Cosmetic`;
  const description = product.seoDescription || product.description;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const data = await readStore();
  const product = data.products.find((p) => p.slug === slug);

  if (!product) notFound();

  const pct = markupPct(data.settings);
  const related = data.products
    .filter((p) => p.category === product.category && p.id !== product.id && p.active)
    .slice(0, 4)
    .map((p) => publicProduct(p, pct));

  return (
    <>
      <ProductDetail
        product={publicProduct(product, pct)}
        whatsapp={data.settings.whatsapp}
        storeName={data.settings.storeName}
      />
      {related.length > 0 && (
        <FeaturedProducts products={related} eyebrow="También te puede gustar" title="Productos relacionados" />
      )}
    </>
  );
}
