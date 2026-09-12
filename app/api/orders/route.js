import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/store";
import { isAdminAuthenticated } from "@/lib/auth";
import { normalizeCoPhone } from "@/lib/whatsapp";

const MAX_ITEMS = 50;
const MAX_STRING = 200;

function clamp(str, max) {
  return String(str || "").slice(0, max);
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const data = await readStore();
  return NextResponse.json(data.orders || []);
}

// Public endpoint: called from the storefront's checkout contact form right
// before opening WhatsApp, so every WhatsApp checkout becomes a trackable
// lead in the CRM even though we have no WhatsApp Business API access.
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.customerName?.trim() || !body.customerPhone?.trim()) {
      return NextResponse.json({ error: "Nombre y WhatsApp son requeridos" }, { status: 400 });
    }
    const items = Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [];

    const order = await updateStore((data) => {
      if (!Array.isArray(data.orders)) data.orders = [];
      const newOrder = {
        id: `o${Date.now()}`,
        createdAt: new Date().toISOString(),
        customerName: clamp(body.customerName, MAX_STRING),
        customerPhone: normalizeCoPhone(clamp(body.customerPhone, 40)),
        items: items.map((it) => ({
          id: clamp(it.id, 50),
          name: clamp(it.name, MAX_STRING),
          price: Number(it.price) || 0,
          qty: Math.max(1, Number(it.qty) || 1),
        })),
        total: Number(body.total) || 0,
        status: "nuevo",
        tags: [],
        notes: [],
        source: "whatsapp",
      };
      data.orders.unshift(newOrder);
      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "No se pudo registrar el pedido" },
      { status: 500 }
    );
  }
}
