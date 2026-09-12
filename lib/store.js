import { promises as fs } from "fs";
import path from "path";
import { put, list } from "@vercel/blob";
import { blobEnabled } from "@/lib/blob";

export { money, slugify } from "@/lib/format";

const DB_PATH = path.join(process.cwd(), "data", "store.json");
const BLOB_PATHNAME = "mariangel/store.json";

async function readLocalSeed() {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

async function readStoreFromBlob() {
  const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
  const found = blobs.find((b) => b.pathname === BLOB_PATHNAME);
  if (!found) return null;
  const res = await fetch(found.url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function writeStoreToBlob(data) {
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function readStore() {
  if (blobEnabled()) {
    const existing = await readStoreFromBlob();
    if (existing) return existing;
    // First run on this Blob store: seed it from the bundled template.
    const seed = await readLocalSeed();
    await writeStoreToBlob(seed);
    return seed;
  }
  return readLocalSeed();
}

async function writeStore(data) {
  if (blobEnabled()) {
    await writeStoreToBlob(data);
  } else {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  }
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
