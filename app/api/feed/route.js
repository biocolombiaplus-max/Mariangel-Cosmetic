import { readStore } from "@/lib/store";
import { buildProductFeedCsv } from "@/lib/feed";

// Public, unauthenticated by design — Meta's Commerce Manager fetches this
// URL on its own schedule (no login), the same way Google Shopping feeds
// work. Connecting it to a Meta catalog is what lets an ad show product
// thumbnails underneath it (Catalog/Collection ad formats).
export async function GET(request) {
  const data = await readStore();
  const origin = new URL(request.url).origin;
  const csv = buildProductFeedCsv(data.products, data.settings, origin);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
