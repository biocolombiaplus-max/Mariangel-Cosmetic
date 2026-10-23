import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { cloudinaryEnabled, listCloudinaryImages } from "@/lib/cloudinary";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!cloudinaryEnabled()) {
    return NextResponse.json({ images: [] });
  }
  try {
    const images = await listCloudinaryImages();
    return NextResponse.json({ images });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "No se pudo cargar la galería de fotos" },
      { status: 500 }
    );
  }
}
