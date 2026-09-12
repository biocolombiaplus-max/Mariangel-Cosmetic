import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { isAdminAuthenticated } from "@/lib/auth";
import { blobEnabled, isVercel, BLOB_NOT_CONFIGURED_MESSAGE } from "@/lib/blob";

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

    if (blobEnabled()) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const blob = await put(`uploads/${filename}`, buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url }, { status: 201 });
    }

    if (isVercel()) {
      // No Blob store connected: public/uploads is read-only here.
      return NextResponse.json({ error: BLOB_NOT_CONFIGURED_MESSAGE }, { status: 500 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "No se pudo subir la imagen" },
      { status: 500 }
    );
  }
}
