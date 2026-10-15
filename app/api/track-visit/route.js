import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/visits";

// Public endpoint, pinged once per browser session from the storefront
// (see components/visit-tracker.js) — intentionally fire-and-forget on the
// client, so a slow or failed write here never affects the page itself.
export async function POST() {
  await recordVisit();
  return NextResponse.json({ ok: true });
}
