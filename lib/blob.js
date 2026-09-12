// Vercel Blob is used automatically in production once a Blob store is
// connected to the project (Vercel injects BLOB_READ_WRITE_TOKEN). Locally,
// or on any host without Blob configured, we fall back to the filesystem.
export function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

// Vercel sets this on every deployment. On Vercel the filesystem is
// read-only at runtime (except /tmp), so writing to data/store.json or
// public/uploads there always fails — we need to detect it and explain
// why, instead of letting an fs error crash the route with a non-JSON
// response.
export function isVercel() {
  return Boolean(process.env.VERCEL);
}

export const BLOB_NOT_CONFIGURED_MESSAGE =
  "Falta conectar el almacenamiento para guardar cambios en producción. En tu proyecto de Vercel ve a Storage → Create Database/Store → Blob, conéctalo a este proyecto y vuelve a desplegar (ver README, sección 'Desplegar en Vercel').";
