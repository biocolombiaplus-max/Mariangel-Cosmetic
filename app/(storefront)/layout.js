export const dynamic = "force-dynamic";

import Header from "@/components/header";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cart-drawer";
import WhatsAppFloatButton from "@/components/whatsapp-float-button";
import PromoBanner from "@/components/sections/promo-banner";
import VisitTracker from "@/components/visit-tracker";
import MetaPixel from "@/components/meta-pixel";
import { readStore } from "@/lib/store";

export default async function StorefrontLayout({ children }) {
  const data = await readStore();

  return (
    <>
      <VisitTracker />
      <MetaPixel pixelId={data.settings.metaPixelId} />
      <PromoBanner messages={data.sections.promo?.messages} />
      <Header logoUrl={data.settings.logo} categories={data.categories} />
      <main className="flex-1">{children}</main>
      <Footer settings={data.settings} footer={data.sections.footer} categories={data.categories} />
      <CartDrawer
        whatsapp={data.settings.whatsapp}
        storeName={data.settings.storeName}
        freeShippingThreshold={data.settings.freeShippingThreshold}
      />
      <WhatsAppFloatButton whatsapp={data.settings.whatsapp} storeName={data.settings.storeName} />
    </>
  );
}
