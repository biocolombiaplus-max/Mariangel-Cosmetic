export const dynamic = "force-dynamic";

import Header from "@/components/header";
import Footer from "@/components/footer";
import CartDrawer from "@/components/cart-drawer";
import WhatsAppFloatButton from "@/components/whatsapp-float-button";
import PromoBanner from "@/components/sections/promo-banner";
import { readStore } from "@/lib/store";

export default async function StorefrontLayout({ children }) {
  const data = await readStore();

  return (
    <>
      <PromoBanner messages={data.sections.promo?.messages} />
      <Header logoUrl={data.settings.logo} categories={data.categories} />
      <main className="flex-1">{children}</main>
      <Footer settings={data.settings} footer={data.sections.footer} categories={data.categories} />
      <CartDrawer whatsapp={data.settings.whatsapp} storeName={data.settings.storeName} />
      <WhatsAppFloatButton whatsapp={data.settings.whatsapp} storeName={data.settings.storeName} />
    </>
  );
}
