export const dynamic = "force-dynamic";

import { readStore } from "@/lib/store";
import { publicProduct } from "@/lib/products";
import { markupPct } from "@/lib/pricing";
import Hero from "@/components/sections/hero";
import TrustBar from "@/components/sections/trust-bar";
import CategoryPills from "@/components/sections/category-pills";
import FeaturedProducts from "@/components/sections/featured-products";
import HowToBuy from "@/components/sections/how-to-buy";
import About from "@/components/sections/about";
import InstagramGallery from "@/components/sections/instagram-gallery";
import Testimonials from "@/components/sections/testimonials";
import WhatsAppCTA from "@/components/sections/whatsapp-cta";

export default async function HomePage() {
  const data = await readStore();
  const pct = markupPct(data.settings);
  const featured = data.products
    .filter((p) => p.featured && p.active)
    .slice(0, 8)
    .map((p) => publicProduct(p, pct));

  return (
    <>
      <Hero slides={data.sections.hero} />
      <TrustBar />
      <CategoryPills categories={data.categories} />
      <FeaturedProducts products={featured} />
      <HowToBuy />
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
