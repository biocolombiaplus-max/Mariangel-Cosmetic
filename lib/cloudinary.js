import { v2 as cloudinary } from "cloudinary";

// Cloudinary is the preferred, more reliable image host for the store —
// a generous free tier built specifically for product photos, so uploads
// don't depend on Vercel Blob's storage/bandwidth quota or billing state.
// Configure either CLOUDINARY_URL, or the three separate CLOUDINARY_*
// vars; either way this only activates once credentials are present.
export function cloudinaryEnabled() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );
}

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
  configured = true;
}

export async function uploadToCloudinary(buffer, { folder = "mariangel" } = {}) {
  ensureConfigured();
  const base64 = `data:application/octet-stream;base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
}

// --- JSON data store (catalog/content), as "raw" Cloudinary resources ---
// Each write uploads the data under a new, never-before-fetched public_id
// (so delivery is never a stale CDN cache hit the way overwriting a fixed
// path would be), then repoints a small fixed-path "pointer" resource at
// it. Readers fetch the pointer, then the data it names — both by exact
// public_id, which Cloudinary serves immediately and consistently. This
// deliberately avoids cloudinary.api.resources() (listing) to find "the
// latest" one: that Admin API search has a real propagation lag after an
// upload, and relying on it here previously meant a read that landed in
// that gap saw no results and treated a brand-new store as never-
// initialized — silently reseeding it with placeholder data and erasing
// whatever was really saved (products, photos, orders).

export function cloudinaryRawUrl(publicId) {
  ensureConfigured();
  return cloudinary.url(publicId, { resource_type: "raw", secure: true });
}

export async function listCloudinaryJSON(prefix) {
  ensureConfigured();
  const res = await cloudinary.api.resources({
    resource_type: "raw",
    type: "upload",
    prefix,
    max_results: 500,
  });
  return res.resources || [];
}

export async function uploadJSONToCloudinary(data, publicId, { overwrite = false } = {}) {
  ensureConfigured();
  const base64 = `data:application/json;base64,${Buffer.from(
    JSON.stringify(data, null, 2)
  ).toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64, {
    public_id: publicId,
    resource_type: "raw",
    overwrite,
    // Only relevant (and only safe to request) when overwriting a fixed
    // path: it purges Cloudinary's CDN cache for that exact URL so the
    // next fetch never serves the previous pointer by accident.
    invalidate: overwrite,
  });
  return result.secure_url;
}

export async function deleteCloudinaryResources(publicIds) {
  if (publicIds.length === 0) return;
  ensureConfigured();
  await cloudinary.api.delete_resources(publicIds, { resource_type: "raw" });
}
