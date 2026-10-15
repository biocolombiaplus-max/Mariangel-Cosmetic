// Fires a Meta Pixel standard event if the pixel script has loaded
// (MetaPixel only injects it once settings.metaPixelId is configured) —
// safe to call unconditionally from anywhere, including when the pixel
// isn't active at all.
export function trackPixelEvent(event, params) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}
