export const dynamic = "force-dynamic";

import { readStore } from "@/lib/store";
import { publicProduct } from "@/lib/products";
import Hero from "@/components/sections/hero";
import CategoryPills from "@/components/sections/category-pills";
import FeaturedProducts from "@/components/sections/featured-products";
import PromoBanner from "@/components/sections/promo-banner";
import About from "@/components/sections/about";
import InstagramGallery from "@/components/sections/instagram-gallery";
import Testimonials from "@/components/sections/testimonials";
import WhatsAppCTA from "@/components/sections/whatsapp-cta";

export default async function HomePage() {
  const data = await readStore();
  const featured = data.products
    .filter((p) => p.featured && p.active)
    .slice(0, 8)
    .map(publicProduct);

  return (
    <>
      <Hero slides={data.sections.hero} />
      <CategoryPills categories={data.categories} />
      <FeaturedProducts products={featured} />
      <PromoBanner promo={data.sections.promo} />
      <About about={data.sections.about} />
      <InstagramGallery
        instagram={data.sections.instagram}
        instagramUrl={data.settings.instagramUrl}
      />
      <Testimonials testimonials={data.sections.testimonials} />
      <WhatsAppCTA whatsapp={data.settings.whatsapp} storeName={data.settings.storeName} />
    </>
  );
}
