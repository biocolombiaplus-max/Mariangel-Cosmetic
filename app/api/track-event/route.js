import { NextResponse } from "next/server";
import { recordEvent } from "@/lib/visits";

// Public, fire-and-forget endpoint for the storefront funnel stages a
// shopper's own browser can report. "lead" and "won" are deliberately NOT
// accepted here — those are only ever recorded server-side (see
// app/api/orders/route.js and app/api/orders/[id]/route.js), so a stray
// request here can't inflate the funnel with fake conversions.
const ALLOWED_EVENTS = ["pageview", "view_product", "add_to_cart", "checkout_start"];

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const name = body?.name;
  if (!ALLOWED_EVENTS.includes(name)) {
    return NextResponse.json({ error: "Evento no válido" }, { status: 400 });
  }
  const source = typeof body?.source === "string" ? body.source.slice(0, 80) : undefined;
  await recordEvent(name, { source });
  return NextResponse.json({ ok: true });
}
