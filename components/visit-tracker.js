"use client";

import { useEffect } from "react";
import { trackFunnelEvent } from "@/lib/track-event";

const SESSION_FLAG = "mariangel_visit_tracked";

// First-touch attribution: whatever brought this browser session to the
// site (an ad's utm_source/utm_campaign, or nothing for direct/organic
// traffic) — captured once per session, shown in /admin/analiticas.
function captureSource() {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source");
    if (!source) return "Directo / Orgánico";
    const campaign = params.get("utm_campaign");
    return campaign ? `${source} · ${campaign}` : source;
  } catch {
    return "Directo / Orgánico";
  }
}

// Counts unique browser sessions, not raw page loads — pings once per tab
// session instead of on every navigation, which is both gentler on the
// backend and closer to what "cuántas personas entran a la página" means.
export default function VisitTracker() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_FLAG)) return;
      window.sessionStorage.setItem(SESSION_FLAG, "1");
    } catch {
      // storage unavailable (private mode, etc.) — just track this load
    }
    trackFunnelEvent("pageview", { source: captureSource() });
  }, []);

  return null;
}
