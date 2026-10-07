import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/auth";
import { blobEnabled, isVercel } from "@/lib/blob";
import { cloudinaryEnabled, uploadToCloudinary } from "@/lib/cloudinary";

const NO_IMAGE_STORAGE_MESSAGE =
  "Falta conectar un almacenamiento de imágenes para poder subir fotos en producción. Lo más confiable es Cloudinary (gratis): crea una cuenta en cloudinary.com, copia tu Cloud name/API Key/API Secret y agrégalos como variables de entorno CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET en tu proyecto de Vercel, luego redeploy. (Alternativa: Storage → Blob en Vercel — ver README).";

const ALLOWED_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
    }
    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json({ error: "Formato de imagen no permitido" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "La imagen supera 8MB" }, { status: 400 });
    }

    const ext = ALLOWED_TYPES[file.type];
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Cloudinary is preferred when configured — a dedicated image CDN with
    // a generous free tier, so uploads don't depend on Vercel Blob's
    // storage/bandwidth quota or billing state.
    if (cloudinaryEnabled()) {
      try {
        const url = await uploadToCloudinary(buffer, { folder: "mariangel/uploads" });
        return NextResponse.json({ url }, { status: 201 });
      } catch (err) {
        // Fall through to Blob (if also configured) instead of failing
        // outright — never let one provider's outage block uploads alone.
        if (!blobEnabled()) throw err;
      }
    }

    if (blobEnabled()) {
      const blob = await put(`uploads/${filename}`, buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    }

    if (isVercel()) {
      // Neither Cloudinary nor Blob configured: public/uploads is
      // read-only here.
      return NextResponse.json({ error: NO_IMAGE_STORAGE_MESSAGE }, { status: 500 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "No se pudo subir la imagen" },
      { status: 500 }
    );
  }
}
