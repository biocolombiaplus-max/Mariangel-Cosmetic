import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";
import { blobEnabled, isVercel, BLOB_NOT_CONFIGURED_MESSAGE } from "@/lib/blob";

export { money, slugify } from "@/lib/format";

const DB_PATH = path.join(process.cwd(), "data", "store.json");
// Every write goes to a brand-new path (like uploaded images already do)
// instead of overwriting one fixed path. Vercel Blob's CDN caches a given
// URL aggressively, so overwriting the same URL in place ("allowOverwrite")
// meant admin saves could silently keep serving the previous version. A
// fresh URL per write is always a cache miss, so readers see the latest
// data immediately; old versions are cleaned up right after each write.
const BLOB_PREFIX = "mariangel/store";

async function readLocalSeed() {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

const DEFAULT_PROMO_MESSAGES = [
  "🚚 ¡ENVÍO GRATIS en Cúcuta, Los Patios y Villa del Rosario! Por compras desde $59.000",
  "🔥 Nuevos ingresos cada semana — no te quedes sin el tuyo",
  "💜 +2.000 pedidos entregados con amor en el área metropolitana",
  "💬 Compra fácil y seguro: pedidos 100% por WhatsApp",
];

// Self-heals older data shapes read from an existing Blob store/local file
// (saved before a schema change) into what the current UI expects, so a
// stale store never just silently renders nothing.
const LEGACY_DEFAULT_PROMO_TEXT =
  "Envíos a toda Colombia · Paga contraentrega · Pedidos por WhatsApp";

function normalizeStore(data) {
  const promo = data.sections?.promo;
  if (promo && !Array.isArray(promo.messages)) {
    // Only preserve the old single line if it was actually customized —
    // if it's still the untouched original placeholder, upgrade it to the
    // current default messages instead of carrying the placeholder forward.
    const customized = promo.text && promo.text !== LEGACY_DEFAULT_PROMO_TEXT;
    data.sections.promo = {
      messages: customized ? [promo.text] : DEFAULT_PROMO_MESSAGES,
    };
  }
  return data;
}

async function latestStoreBlob() {
  const { blobs } = await list({ prefix: BLOB_PREFIX, limit: 1000 });
  if (blobs.length === 0) return null;
  return blobs.reduce((latest, b) =>
    new Date(b.uploadedAt) > new Date(latest.uploadedAt) ? b : latest
  );
}

async function readStoreFromBlob() {
  const found = await latestStoreBlob();
  if (!found) return null;
  const res = await fetch(found.url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function writeStoreToBlob(data) {
  const { blobs: previous } = await list({ prefix: BLOB_PREFIX, limit: 1000 });
  await put(`${BLOB_PREFIX}-${Date.now()}.json`, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: true,
  });
  if (previous.length > 0) {
    await del(previous.map((b) => b.url)).catch(() => {});
  }
}

export async function readStore() {
  if (blobEnabled()) {
    const existing = await readStoreFromBlob();
    if (existing) return normalizeStore(existing);
    // First run on this Blob store: seed it from the bundled template.
    const seed = await readLocalSeed();
    await writeStoreToBlob(seed);
    return seed;
  }
  return normalizeStore(await readLocalSeed());
}

async function writeStore(data) {
  if (blobEnabled()) {
    await writeStoreToBlob(data);
    return;
  }
  if (isVercel()) {
    // No Blob store connected: the project's filesystem is read-only here,
    // so writing to data/store.json would silently fail with an fs error.
    throw new Error(BLOB_NOT_CONFIGURED_MESSAGE);
  }
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

let writeQueue = Promise.resolve();

// Serializes writes so concurrent admin edits on the same instance never
// clobber each other. (Across different serverless instances this can't be
// fully guaranteed without a real database — acceptable for a small store's
// admin traffic.)
export function updateStore(mutator) {
  writeQueue = writeQueue.then(async () => {
    const data = await readStore();
    const result = await mutator(data);
    await writeStore(data);
    return result;
  });
  return writeQueue;
}
