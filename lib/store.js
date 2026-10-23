import { promises as fs } from "fs";
import path from "path";
import { put, list, del } from "@vercel/blob";
import { blobEnabled, isVercel } from "@/lib/blob";
import {
  cloudinaryEnabled,
  cloudinaryRawUrl,
  listCloudinaryJSON,
  uploadJSONToCloudinary,
  deleteCloudinaryResources,
} from "@/lib/cloudinary";
import { normalizeOptions, mergeVariants } from "@/lib/variants";

export { money, slugify } from "@/lib/format";

const DB_PATH = path.join(process.cwd(), "data", "store.json");
// Every write of the actual data goes to a brand-new path (like uploaded
// images already do) instead of overwriting one fixed path — both
// Cloudinary's and Vercel Blob's CDN cache a given URL aggressively, so
// overwriting one in place meant admin saves could silently keep serving
// the previous version. Old versions are cleaned up right after each
// write. The Cloudinary backend below still needs one fixed path — see
// STORE_POINTER_ID — to say which of those fresh paths is current.
const STORE_PREFIX = "mariangel/store";
// A fixed path that always holds just `{ latest: "<public_id>" }`, pointing
// at the real data's current (uniquely-named) resource. See the comment on
// uploadJSONToCloudinary for why reads go through this instead of listing.
const STORE_POINTER_ID = `${STORE_PREFIX}-pointer`;

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
  data.sections = data.sections || {};
  // Backfills two landing sections added after the original schema, so a
  // store saved before they existed (or the committed seed) never crashes
  // the admin tabs or storefront that now expect them.
  data.sections.whatsappReviews = {
    title: "Lo que nos escriben por WhatsApp",
    items: [],
    ...data.sections.whatsappReviews,
  };
  data.sections.tips = {
    title: "Tips de maquillaje",
    items: [],
    ...data.sections.tips,
  };
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
  // Backfills fields added to the product schema after older products were
  // first saved (variants, tags, SEO fields, ...) with their safe empty
  // defaults, so UI that assumes they always exist never crashes on
  // legacy data — then heals products saved before normalizeOptions()
  // merged same-named option rows (e.g. two separate "Tono" rows), which
  // would otherwise keep rendering as two broken selector groups forever.
  data.products = (data.products || []).map((p) => {
    const withDefaults = {
      options: [],
      variants: [],
      tags: [],
      sku: "",
      seoTitle: "",
      seoDescription: "",
      ...p,
    };
    if (!withDefaults.options.length) return withDefaults;
    const options = normalizeOptions(withDefaults.options);
    return { ...withDefaults, options, variants: mergeVariants(withDefaults.variants, options) };
  });
  return data;
}

// Each backend exposes the same tiny interface — read() distinguishes a
// genuinely empty store ("empty", safe to seed once) from a failed read
// ("error", never safe to treat as empty), and write() persists a fresh
// version. readStore()/updateStore() below don't need to know which
// backend is actually in use.

async function fetchCloudinaryJSON(publicId) {
  const res = await fetch(cloudinaryRawUrl(publicId), { cache: "no-store" });
  if (res.status === 404) return { status: "empty" };
  if (!res.ok) return { status: "error" };
  try {
    return { status: "ok", data: await res.json() };
  } catch {
    return { status: "error" };
  }
}

// Only a transitional fallback for a store saved before the pointer
// existed (see cloudinaryBackend.read): the old "list everything under the
// prefix, pick the newest by created_at" lookup. Never used once the
// pointer is in place — the first write re-establishes it for good.
async function legacyListRead() {
  let resources;
  try {
    resources = await listCloudinaryJSON(STORE_PREFIX);
  } catch {
    return { status: "error" };
  }
  resources = resources.filter((r) => r.public_id !== STORE_POINTER_ID);
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
}

const cloudinaryBackend = {
  async read() {
    let pointer;
    try {
      pointer = await fetchCloudinaryJSON(STORE_POINTER_ID);
    } catch {
      return { status: "error" };
    }
    if (pointer.status === "ok" && pointer.data?.latest) {
      try {
        return await fetchCloudinaryJSON(pointer.data.latest);
      } catch {
        return { status: "error" };
      }
    }
    if (pointer.status === "error") return pointer;
    // No pointer resource yet — either genuinely never initialized, or
    // (the important case) this store was saved before the pointer scheme
    // existed. Falling straight to "empty" here would reseed over real
    // data saved under the old scheme, so check there before giving up.
    return legacyListRead();
  },
  async write(data) {
    const id = `${STORE_PREFIX}-${Date.now()}`;
    await uploadJSONToCloudinary(data, id);
    await uploadJSONToCloudinary({ latest: id }, STORE_POINTER_ID, { overwrite: true });
    // Best-effort cleanup of older data resources — the pointer above is
    // the only thing reads depend on, so a failure or a lag here can never
    // cause a reader to see stale or missing data, only extra storage used.
    try {
      const previous = await listCloudinaryJSON(STORE_PREFIX);
      const stale = previous
        .map((r) => r.public_id)
        .filter((publicId) => publicId !== id && publicId !== STORE_POINTER_ID);
      if (stale.length > 0) await deleteCloudinaryResources(stale);
    } catch {
      // ignore — cleanup is not load-bearing
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

// A storage listing that comes back empty is treated as "never initialized"
// and triggers seeding the bundled placeholder data as the real store going
// forward — so it's confirmed with retries first. A one-off empty listing
// (API hiccup, eventual-consistency gap right after a write) must never be
// allowed to permanently overwrite a real store with placeholder content.
async function confirmEmpty(backend) {
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 500));
    const result = await backend.read();
    if (result.status !== "empty") return result;
  }
  return { status: "empty" };
}

export async function readStore() {
  const backend = activeBackend();
  if (backend) {
    let result = await backend.read();
    if (result.status === "empty") result = await confirmEmpty(backend);
    if (result.status === "ok") return normalizeStore(result.data);
    if (result.status === "empty") {
      // Confirmed empty across several attempts: seed it once.
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
    let result = await backend.read();
    if (result.status === "empty") result = await confirmEmpty(backend);
    if (result.status === "ok") return normalizeStore(result.data);
    if (result.status === "empty") return normalizeStore(await readLocalSeed());
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
