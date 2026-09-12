// Vercel Blob is used automatically in production once a Blob store is
// connected to the project (Vercel injects BLOB_READ_WRITE_TOKEN). Locally,
// or on any host without Blob configured, we fall back to the filesystem.
export function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
