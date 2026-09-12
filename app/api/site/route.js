import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/store";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const data = await readStore();
  const { settings, sections, categories } = data;
  return NextResponse.json({ settings, sections, categories });
}

// Shallow-merges the posted keys (settings/sections/categories) into the store.
export async function PUT(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const updated = await updateStore((data) => {
    if (body.settings) data.settings = { ...data.settings, ...body.settings };
    if (body.sections) data.sections = { ...data.sections, ...body.sections };
    if (body.categories) data.categories = body.categories;
    return { settings: data.settings, sections: data.sections, categories: data.categories };
  });

  return NextResponse.json(updated);
}
