// Fire-and-forget pings to our own /api/track-event, feeding the admin's
// funnel analytics (/admin/analiticas) — separate from the Meta Pixel
// events (lib/meta-pixel-events.js), which only Meta ever sees.
export function trackFunnelEvent(name, extra) {
  if (typeof window === "undefined") return;
  fetch("/api/track-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, ...extra }),
  }).catch(() => {});
}
