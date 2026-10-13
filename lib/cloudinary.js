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
// Mirrors the same "fresh path per write" pattern used for Vercel Blob:
// Cloudinary's CDN caches a given URL, so a stable path would keep
// serving a stale version after a save. Each write uploads under a new,
// never-before-fetched public_id and prunes the older ones afterward.

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

export async function uploadJSONToCloudinary(data, publicId) {
  ensureConfigured();
  const base64 = `data:application/json;base64,${Buffer.from(
    JSON.stringify(data, null, 2)
  ).toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64, {
    public_id: publicId,
    resource_type: "raw",
  });
  return result.secure_url;
}

export async function deleteCloudinaryResources(publicIds) {
  if (publicIds.length === 0) return;
  ensureConfigured();
  await cloudinary.api.delete_resources(publicIds, { resource_type: "raw" });
}
