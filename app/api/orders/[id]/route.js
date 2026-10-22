import { NextResponse } from "next/server";
import { updateStore } from "@/lib/store";
import { isAdminAuthenticated } from "@/lib/auth";
import { STAGE_KEYS } from "@/lib/crm";
import { recordEvent } from "@/lib/visits";
import { markupPct, applyMarkup } from "@/lib/pricing";
import { variantLabel } from "@/lib/variants";

export async function PUT(request, { params }) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

    let justWon = false;
    const updated = await updateStore((data) => {
      const idx = (data.orders || []).findIndex((o) => o.id === id);
      if (idx === -1) return null;
      const order = data.orders[idx];

      if (body.status && STAGE_KEYS.includes(body.status)) {
        // Captures the moment a sale is actually confirmed, so commission
        // cycles (see lib/commission.js) are based on when it was won, not
        // when the lead first came in.
        if (body.status === "ganado" && order.status !== "ganado") {
          order.wonAt = new Date().toISOString();
          justWon = true;
        }
        order.status = body.status;
      }
      if (Array.isArray(body.tags)) {
        order.tags = body.tags.slice(0, 20).map((t) => String(t).slice(0, 40));
      }
      if (typeof body.addNote === "string" && body.addNote.trim()) {
        order.notes = [
          ...(order.notes || []),
          {
            id: `n${Date.now()}`,
            text: body.addNote.trim().slice(0, 1000),
            createdAt: new Date().toISOString(),
          },
        ];
      }
      if (typeof body.shippingGuide === "string") {
        order.shippingGuide = body.shippingGuide.trim().slice(0, 100);
      }

      // Lets a lead that arrived with no cart (a general WhatsApp question,
      // not a structured order) get the real product(s) attached once the
      // sale actually closes in chat — otherwise it could never count
      // toward profit or Biomarketing's commission when marked "Ganado".
      // Price/cost always come from the current catalog, never the
      // request, so this can't be used to fake a different price.
      if (body.addItem?.id) {
        const [productId, variantId] = String(body.addItem.id).split("::");
        const product = (data.products || []).find((p) => p.id === productId);
        if (product) {
          const variant = variantId ? product.variants?.find((v) => v.id === variantId) : null;
          const pct = markupPct(data.settings);
          const basePrice = variant?.price ?? product.price;
          order.items = [
            ...(order.items || []),
            {
              id: variant ? `${productId}::${variant.id}` : productId,
              name: variant ? `${product.name} (${variantLabel(variant.values)})` : product.name,
              price: applyMarkup(basePrice, pct),
              basePrice,
              image: variant?.image || product.images?.[0] || "",
              qty: Math.max(1, Number(body.addItem.qty) || 1),
            },
          ];
          order.total = order.items.reduce((s, it) => s + it.price * it.qty, 0);
        }
      }
      if (typeof body.removeItemId === "string") {
        order.items = (order.items || []).filter((it) => it.id !== body.removeItemId);
        order.total = order.items.reduce((s, it) => s + it.price * it.qty, 0);
      }

      data.orders[idx] = order;
      return order;
    });

    if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (justWon) recordEvent("won");
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "No se pudo actualizar el pedido" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;

    const removed = await updateStore((data) => {
      const idx = (data.orders || []).findIndex((o) => o.id === id);
      if (idx === -1) return false;
      data.orders.splice(idx, 1);
      return true;
    });

    if (!removed) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "No se pudo eliminar el pedido" },
      { status: 500 }
    );
  }
}
