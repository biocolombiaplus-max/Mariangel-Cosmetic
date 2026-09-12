import { money } from "@/lib/format";

export function waLink(phone, message) {
  const digits = String(phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildCartMessage(storeName, items, total) {
  const lines = [
    `¡Hola ${storeName}! 💕 Quiero hacer este pedido:`,
    "",
    ...items.map(
      (it) => `• ${it.name} x${it.qty} — ${money(it.price * it.qty)}`
    ),
    "",
    `Total: ${money(total)}`,
    "",
    "Quedo atenta a los datos para el envío. ¡Gracias!",
  ];
  return lines.join("\n");
}

export function buildProductMessage(storeName, product) {
  return [
    `¡Hola ${storeName}! 💕 Me interesa este producto:`,
    "",
    `• ${product.name} — ${money(product.price)}`,
    "",
    "¿Me ayudas con la disponibilidad y el envío?",
  ].join("\n");
}
