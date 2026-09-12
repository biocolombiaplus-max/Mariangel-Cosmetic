import { money } from "@/lib/format";

// Pipeline stages for the CRM board — shared between the admin UI and the
// API so status values stay in sync.
export const STAGES = [
  { key: "nuevo", label: "Nuevo", dot: "bg-brand-orchid-500" },
  { key: "contactado", label: "Contactado", dot: "bg-sky-500" },
  { key: "negociacion", label: "En negociación", dot: "bg-amber-500" },
  { key: "ganado", label: "Ganado", dot: "bg-green-600" },
  { key: "perdido", label: "Perdido", dot: "bg-red-500" },
];

export const STAGE_KEYS = STAGES.map((s) => s.key);

export function stageLabel(key) {
  return STAGES.find((s) => s.key === key)?.label || key;
}

// A friendly follow-up message for remarketing — one tap from the CRM card
// straight into a WhatsApp chat with that lead.
export function remarketingMessage(storeName, order) {
  return `¡Hola ${order.customerName}! 💕 Soy de ${storeName}. Quería hacerte seguimiento a tu pedido por ${money(
    order.total
  )}. ¿Te ayudo a completarlo o tienes alguna duda?`;
}
