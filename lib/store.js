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
import { normalizeOptions, mergeVariants } from "@/lib/variants";

export { money, slugify } from "@/lib/format";

const DB_PATH = path.join(process.cwd(), "data", "store.json");
// Every write goes to a brand-new path (like uploaded images already do)
// instead of overwriting one fixed path. Both Cloudinary's and Vercel
// Blob's CDN cache a given URL aggressively, so overwriting one in place
// meant admin saves could silently keep serving the previous version. A
// fresh path per write is always a cache miss, so readers see the latest
// data immediately; old versions are cleaned up right after each write.
const STORE_PREFIX = "mariangel/store";

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

// Self-heals older data shapes read from an existing store (saved before a
// schema change) into what the current UI expects, so a stale store never
// just silently renders nothing.
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
  // Heals products saved before normalizeOptions() merged same-named option
  // rows (e.g. two separate "Tono" rows) — without this, a product saved
  // with the old bug keeps rendering as two broken selector groups forever.
  data.products = (data.products || []).map((p) => {
    if (!p.options?.length) return p;
    const options = normalizeOptions(p.options);
    return { ...p, options, variants: mergeVariants(p.variants, options) };
  });
  return data;
}

// Each backend exposes the same tiny interface — read() distinguishes a
// genuinely empty store ("empty", safe to seed once) from a failed read
// ("error", never safe to treat as empty), and write() persists a fresh
// version. readStore()/updateStore() below don't need to know which
// backend is actually in use.

const cloudinaryBackend = {
  async read() {
    let resources;
    try {
      resources = await listCloudinaryJSON(STORE_PREFIX);
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
      return { status: "ok", data: await res.json() };
    } catch {
      return { status: "error" };
    }
  },
  async write(data) {
    const previous = await listCloudinaryJSON(STORE_PREFIX).catch(() => []);
    await uploadJSONToCloudinary(data, `${STORE_PREFIX}-${Date.now()}`);
    if (previous.length > 0) {
      await deleteCloudinaryResources(previous.map((r) => r.public_id)).catch(() => {});
    }
  },
};

const blobBackend = {
  async read() {
    let blobs;
    try {
      ({ blobs } = await list({ prefix: STORE_PREFIX, limit: 1000 }));
    } catch {
      return { status: "error" };
    }
    if (blobs.length === 0) return { status: "empty" };
    const latest = blobs.reduce((a, b) =>
      new Date(b.uploadedAt) > new Date(a.uploadedAt) ? b : a
    );
    try {
      const res = await fetch(latest.url, { cache: "no-store" });
      if (!res.ok) return { status: "error" };
      return { status: "ok", data: await res.json() };
    } catch {
      return { status: "error" };
    }
  },
  async write(data) {
    const { blobs: previous } = await list({ prefix: STORE_PREFIX, limit: 1000 });
    await put(`${STORE_PREFIX}-${Date.now()}.json`, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
    });
    if (previous.length > 0) {
      await del(previous.map((b) => b.url)).catch(() => {});
    }
  },
};

// Cloudinary is preferred when configured: it's what admin image uploads
// already use, so once it's set up the whole store (catalog, content,
// orders) stops depending on Vercel Blob's quota/billing state entirely.
function activeBackend() {
  if (cloudinaryEnabled()) return cloudinaryBackend;
  if (blobEnabled()) return blobBackend;
  return null;
}

export const NO_STORAGE_CONFIGURED_MESSAGE =
  "Falta conectar un almacenamiento para guardar cambios en producción. Lo más confiable es Cloudinary (gratis): crea una cuenta en cloudinary.com y agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET como variables de entorno en Vercel, luego redeploy. (Alternativa: Storage → Blob en Vercel — ver README).";

export async function readStore() {
  const backend = activeBackend();
  if (backend) {
    const result = await backend.read();
    if (result.status === "ok") return normalizeStore(result.data);
    if (result.status === "empty") {
      // Genuinely nothing saved yet on this backend: seed it once.
      const seed = await readLocalSeed();
      await backend.write(seed);
      return seed;
    }
    // Transient error reaching storage — never overwrite real data on a
    // hunch. Just serve the bundled seed for this one read.
    return normalizeStore(await readLocalSeed());
  }
  return normalizeStore(await readLocalSeed());
}

async function writeStore(data) {
  const backend = activeBackend();
  if (backend) {
    await backend.write(data);
    return;
  }
  if (isVercel()) {
    // Nothing configured: the project's filesystem is read-only here, so
    // writing to data/store.json would silently fail with an fs error.
    throw new Error(NO_STORAGE_CONFIGURED_MESSAGE);
  }
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Reading before a write is held to a stricter standard than a normal page
// read: it retries a transient error a couple of times, and if it still
// can't confirm the real current state, it throws instead of writing over
// data it never actually saw.
async function readStoreForWrite() {
  const backend = activeBackend();
  if (!backend) return normalizeStore(await readLocalSeed());

  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await backend.read();
    if (result.status === "ok") return normalizeStore(result.data);
    if (result.status === "empty") return readLocalSeed();
    if (attempt < 2) await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(
    "No se pudo confirmar el estado actual de la tienda antes de guardar. Intenta de nuevo en unos segundos."
  );
}

let writeQueue = Promise.resolve();

// Serializes writes so concurrent admin edits on the same instance never
// clobber each other. (Across different serverless instances this can't be
// fully guaranteed without a real database — acceptable for a small store's
// admin traffic.)
export function updateStore(mutator) {
  writeQueue = writeQueue.then(async () => {
    const data = await readStoreForWrite();
    const result = await mutator(data);
    await writeStore(data);
    return result;
  });
  return writeQueue;
}
