"use client";

import { useState } from "react";
import SettingsTab from "@/components/admin/content/settings-tab";
import HeroTab from "@/components/admin/content/hero-tab";
import PromoAboutTab from "@/components/admin/content/promo-about-tab";
import InstagramTab from "@/components/admin/content/instagram-tab";
import TestimonialsTab from "@/components/admin/content/testimonials-tab";
import WhatsappReviewsTab from "@/components/admin/content/whatsapp-reviews-tab";
import TipsTab from "@/components/admin/content/tips-tab";
import FooterTab from "@/components/admin/content/footer-tab";

const TABS = [
  { key: "settings", label: "General", icon: "⚙️" },
  { key: "hero", label: "Portada (Hero)", icon: "🖼️" },
  { key: "promo", label: "Promo / Nosotros", icon: "💬" },
  { key: "instagram", label: "Instagram", icon: "📸" },
  { key: "testimonials", label: "Testimonios", icon: "⭐" },
  { key: "whatsappReviews", label: "Capturas de WhatsApp", icon: "📲" },
  { key: "tips", label: "Tips de maquillaje", icon: "💡" },
  { key: "footer", label: "Pie de página", icon: "📍" },
];

export default function ContentEditor({ settings, sections, products = [] }) {
  const [tab, setTab] = useState("settings");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-brand-plum-600 text-white"
                : "bg-white text-brand-deep-900/70 ring-1 ring-brand-blush-100 hover:bg-brand-blush-50"
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === "settings" && <SettingsTab settings={settings} />}
      {tab === "hero" && <HeroTab hero={sections.hero} />}
      {tab === "promo" && <PromoAboutTab promo={sections.promo} about={sections.about} />}
      {tab === "instagram" && <InstagramTab instagram={sections.instagram} />}
      {tab === "testimonials" && <TestimonialsTab testimonials={sections.testimonials} />}
      {tab === "whatsappReviews" && (
        <WhatsappReviewsTab whatsappReviews={sections.whatsappReviews} />
      )}
      {tab === "tips" && <TipsTab tips={sections.tips} products={products} />}
      {tab === "footer" && <FooterTab footer={sections.footer} />}
    </div>
  );
}
