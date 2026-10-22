// A small, independent analytics event counter — separate storage
// document, own write queue — so a burst of shopper traffic (e.g. right
// after an ad campaign goes live) never shares a write queue with
// product/order saves and can't slow those down or collide with them.
// It's intentionally best-effort: losing an occasional event here is
// harmless, unlike losing catalog/order data, so failures are swallowed
// instead of thrown.
//
// Shape: { events: { "YYYY-MM-DD": { pageview: 3, view_product: 1, ... } },
//          sources: { "YYYY-MM-DD": { "facebook/CONV_...": 2 } } }
// — a day's bucket for each funnel stage, plus a day's bucket for where
// visits came from (first-touch UTM source per session).
import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";
import { blobEnabled, isVercel } from "@/lib/blob";
import {
  cloudinaryEnabled,
  listCloudinaryJSON,
  uploadJSONToCloudinary,
  deleteCloudinaryResources,
} from "@/lib/cloudinary";

const PREFIX = "mariangel/visits";
const LOCAL_PATH = path.join(process.cwd(), "data", "visits.json");
const EMPTY = { events: {}, sources: {} };
// Keep roughly 2 months of daily buckets so the document never grows
// without bound — the admin dashboard only ever shows the last 7/30 days.
const RETENTION_DAYS = 60;

// The full funnel, in order — every stage after "pageview" is a subset of
// the one before it, so the admin page can show both a drop-off from the
// previous stage and a share of total traffic.
export const FUNNEL_STAGES = [
  { key: "pageview", label: "Visitas a la tienda", icon: "👀" },
  { key: "view_product", label: "Vieron un producto", icon: "🔍" },
  { key: "add_to_cart", label: "Agregaron al carrito", icon: "🛒" },
  { key: "checkout_start", label: "Iniciaron el pedido", icon: "📝" },
  { key: "lead", label: "Dejaron sus datos", icon: "📱" },
  { key: "won", label: "Compra confirmada", icon: "✅" },
];

const cloudinaryBackend = {
  async read() {
    let resources;
    try {
      resources = await listCloudinaryJSON(PREFIX);
    } catch {
      return { status: "error" };
    }
    if (resources.length === 0) return { status: "empty" };
    const latest = resources.reduce((a, b) =>
      new Date(b.created_at) > new Date(a.created_at) ? b : a
    );
    try {
      const res = await fetch(latest.secure_url, { cache: "no-store" });
      if (!res.ok) return { status: "error" };
      const data = await res.json();
      return { status: "ok", data, previous: resources.map((r) => r.public_id) };
    } catch {
      return { status: "error" };
    }
  },
  async write(data, previous) {
    await uploadJSONToCloudinary(data, `${PREFIX}-${Date.now()}`);
    if (previous?.length) await deleteCloudinaryResources(previous).catch(() => {});
  },
};

const blobBackend = {
  async read() {
    try {
      const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
      if (blobs.length === 0) return { status: "empty" };
      const latest = blobs.reduce((a, b) =>
        new Date(b.uploadedAt) > new Date(a.uploadedAt) ? b : a
      );
      const res = await fetch(latest.url, { cache: "no-store" });
      if (!res.ok) return { status: "error" };
      const data = await res.json();
      return { status: "ok", data, previous: blobs.map((b) => b.url) };
    } catch {
      return { status: "error" };
    }
  },
  async write(data, previous) {
    await put(`${PREFIX}-${Date.now()}.json`, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
    });
    if (previous?.length) await del(previous).catch(() => {});
  },
};

function activeBackend() {
  if (cloudinaryEnabled()) return cloudinaryBackend;
  if (blobEnabled()) return blobBackend;
  return null;
}

async function readLocal() {
  try {
    return JSON.parse(await fs.readFile(LOCAL_PATH, "utf-8"));
  } catch {
    return EMPTY;
  }
}

function prune(byDate) {
  const cutoff = Date.now() - RETENTION_DAYS * 86400000;
  for (const key of Object.keys(byDate)) {
    if (new Date(key).getTime() < cutoff) delete byDate[key];
  }
  return byDate;
}

// Heals the previous version's data (which only ever tracked raw page
// visits as { visits: { date: count } }) into the current shape, so
// whatever traffic was already recorded in production isn't lost.
function normalize(data) {
  if (!data.events && data.visits) {
    data.events = Object.fromEntries(
      Object.entries(data.visits).map(([date, count]) => [date, { pageview: count }])
    );
  }
  data.events = data.events || {};
  data.sources = data.sources || {};
  return data;
}

export async function readAnalytics() {
  const backend = activeBackend();
  if (!backend) return normalize(isVercel() ? { ...EMPTY } : await readLocal());
  const result = await backend.read();
  return normalize(result.status === "ok" ? result.data : { ...EMPTY });
}

let writeQueue = Promise.resolve();

// Fire-and-forget: increments today's bucket for this event by one, and
// (for pageviews with a known source) the day's traffic-source bucket.
// Never throws — a lost analytics event is never worth risking the
// shopper's actual request.
export function recordEvent(name, { source } = {}) {
  writeQueue = writeQueue
    .then(async () => {
      const today = new Date().toISOString().slice(0, 10);
      const backend = activeBackend();

      const apply = (data) => {
        data.events = prune(data.events || {});
        data.sources = prune(data.sources || {});
        data.events[today] = data.events[today] || {};
        data.events[today][name] = (data.events[today][name] || 0) + 1;
        if (source && name === "pageview") {
          data.sources[today] = data.sources[today] || {};
          data.sources[today][source] = (data.sources[today][source] || 0) + 1;
        }
        return data;
      };

      if (!backend) {
        if (isVercel()) return; // nothing configured — silently skip
        const data = apply(normalize(await readLocal()));
        await fs
          .writeFile(LOCAL_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8")
          .catch(() => {});
        return;
      }

      const result = await backend.read();
      const data = apply(normalize(result.status === "ok" ? result.data : { ...EMPTY }));
      const previous = result.status === "ok" ? result.previous : undefined;
      await backend.write(data, previous);
    })
    .catch(() => {});
  return writeQueue;
}

function lastNDays(n) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Last 7 calendar days (oldest first) plus today's count, for the small
// traffic card on the main admin dashboard.
export function visitStats(data) {
  const events = data?.events || {};
  const days = lastNDays(7).map((date) => ({ date, count: events[date]?.pageview || 0 }));
  return {
    today: days[days.length - 1].count,
    last7Days: days,
    total7Days: days.reduce((sum, d) => sum + d.count, 0),
  };
}

// The full Shopify-style funnel for the admin analytics page: a count and
// conversion % per stage over the chosen window, a daily traffic trend,
// and the top UTM sources that traffic came from.
export function funnelStats(data, days = 7) {
  const events = data?.events || {};
  const sources = data?.sources || {};
  const dates = lastNDays(days);

  const totals = Object.fromEntries(FUNNEL_STAGES.map((s) => [s.key, 0]));
  for (const date of dates) {
    const day = events[date] || {};
    for (const stage of FUNNEL_STAGES) totals[stage.key] += day[stage.key] || 0;
  }

  const stages = FUNNEL_STAGES.map((stage, i) => {
    const count = totals[stage.key];
    const prevCount = i === 0 ? count : totals[FUNNEL_STAGES[i - 1].key];
    return {
      ...stage,
      count,
      pctOfPrev: prevCount > 0 ? Math.round((count / prevCount) * 100) : i === 0 ? 100 : 0,
      pctOfTotal: totals.pageview > 0 ? Math.round((count / totals.pageview) * 100) : 0,
    };
  });

  const trend = dates.map((date) => ({ date, count: events[date]?.pageview || 0 }));

  const sourceTotals = {};
  for (const date of dates) {
    for (const [source, count] of Object.entries(sources[date] || {})) {
      sourceTotals[source] = (sourceTotals[source] || 0) + count;
    }
  }
  const topSources = Object.entries(sourceTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([source, count]) => ({ source, count }));

  return { days, stages, trend, topSources };
}
