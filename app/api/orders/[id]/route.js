import { NextResponse } from "next/server";
import { updateStore } from "@/lib/store";
import { isAdminAuthenticated } from "@/lib/auth";
import { STAGE_KEYS } from "@/lib/crm";
import { recordEvent } from "@/lib/visits";

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
