import { money } from "@/lib/format";

export function waLink(phone, message) {
  const digits = String(phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Customers usually type their local 10-digit Colombian number without the
// country code — wa.me needs the full international number to work, so we
// assume Colombia (+57) when a code isn't already present.
export function normalizeCoPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `57${digits}`;
  return digits;
}

// wa.me messages are plain text — WhatsApp can't attach a real image to a
// pre-filled message, so the closest thing to "arrives with the photo" is a
// link that opens it in one tap. Product images are stored as relative
// paths ("/products/x.jpg"), so they need the site's own origin in front to
// be a working link once pasted into WhatsApp.
function absoluteImageUrl(image, origin) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "");
  if (!base) return "";
  return `${base}${image.startsWith("/") ? "" : "/"}${image}`;
}

// A short, human-friendly reference pulled from the order's own id (which
// is just a timestamp) — enough for Mariangel to say "vi tu pedido
// #482913" back to the customer and have it feel like a real confirmed
// order, without exposing the full internal id.
export function orderReference(orderId) {
  return String(orderId || "").replace(/\D/g, "").slice(-6);
}

export function buildOrderMessage(storeName, customerName, items, total, { origin, orderId, customerPhone } = {}) {
  const lines = [
    `¡Hola ${storeName}! 💕 Soy ${customerName} y quiero hacer este pedido:`,
    "",
  ];
  if (orderId) lines.push(`🧾 Pedido #${orderReference(orderId)}`);
  if (customerPhone) lines.push(`📱 Mi WhatsApp: +${customerPhone}`);
  lines.push(
    "",
    ...items.flatMap((it) => {
      const line = `• ${it.name} x${it.qty} — ${money(it.price * it.qty)}`;
      const photoUrl = absoluteImageUrl(it.image, origin);
      return photoUrl ? [line, `  📸 Foto: ${photoUrl}`] : [line];
    }),
    "",
    `Total: ${money(total)}`,
    "",
    "Quedo atenta a los datos para el envío. ¡Gracias!"
  );
  return lines.join("\n");
}
