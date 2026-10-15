// A small, independent visit counter — separate storage document, own
// write queue — so a burst of shopper traffic (e.g. right after an ad
// campaign goes live) never shares a write queue with product/order saves
// and can't slow those down or collide with them. It's intentionally
// best-effort: losing an occasional pageview here is harmless, unlike
// losing catalog/order data, so failures are swallowed instead of thrown.
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
const EMPTY = { visits: {} };
// Keep roughly 2 months of daily buckets so the document never grows
// without bound — the admin dashboard only ever shows the last 7 days.
const RETENTION_DAYS = 60;

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

function prune(visits) {
  const cutoff = Date.now() - RETENTION_DAYS * 86400000;
  for (const key of Object.keys(visits)) {
    if (new Date(key).getTime() < cutoff) delete visits[key];
  }
  return visits;
}

export async function readVisits() {
  const backend = activeBackend();
  if (!backend) return isVercel() ? EMPTY : readLocal();
  const result = await backend.read();
  return result.status === "ok" ? result.data : EMPTY;
}

let writeQueue = Promise.resolve();

// Fire-and-forget: increments today's bucket by one. Never throws.
export function recordVisit() {
  writeQueue = writeQueue.then(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const backend = activeBackend();

    if (!backend) {
      if (isVercel()) return; // nothing configured — silently skip
      const data = await readLocal();
      data.visits = prune(data.visits || {});
      data.visits[today] = (data.visits[today] || 0) + 1;
      await fs.writeFile(LOCAL_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8").catch(() => {});
      return;
    }

    const result = await backend.read();
    const data = result.status === "ok" ? result.data : EMPTY;
    data.visits = prune(data.visits || {});
    data.visits[today] = (data.visits[today] || 0) + 1;
    const previous = result.status === "ok" ? result.previous : undefined;
    await backend.write(data, previous);
  }).catch(() => {});
  return writeQueue;
}

// Last 7 calendar days (oldest first) plus today's count, for a small
// trend on the admin dashboard.
export function visitStats(data) {
  const visits = data?.visits || {};
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: visits[key] || 0 });
  }
  return {
    today: days[days.length - 1].count,
    last7Days: days,
    total7Days: days.reduce((sum, d) => sum + d.count, 0),
  };
}
