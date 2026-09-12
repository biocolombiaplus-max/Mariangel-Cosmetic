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

export function buildOrderMessage(storeName, customerName, items, total) {
  const lines = [
    `¡Hola ${storeName}! 💕 Soy ${customerName} y quiero hacer este pedido:`,
    "",
    ...items.map((it) => `• ${it.name} x${it.qty} — ${money(it.price * it.qty)}`),
    "",
    `Total: ${money(total)}`,
    "",
    "Quedo atenta a los datos para el envío. ¡Gracias!",
  ];
  return lines.join("\n");
}
