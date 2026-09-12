import { Poppins, Pacifico } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart-context";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const script = Pacifico({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: "Mariangel Cosmetic | Maquillaje y Skincare Juvenil",
  description:
    "Tienda online de maquillaje y skincare juvenil. Labiales, rubores, paletas, brochas y sets. Envíos a toda Colombia, pedidos por WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${poppins.variable} ${script.variable}`}>
      <body className="min-h-full flex flex-col bg-brand-cream text-[--foreground] antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
