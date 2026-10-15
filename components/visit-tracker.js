"use client";

import { useEffect } from "react";

const SESSION_FLAG = "mariangel_visit_tracked";

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
    fetch("/api/track-visit", { method: "POST" }).catch(() => {});
  }, []);

  return null;
}
