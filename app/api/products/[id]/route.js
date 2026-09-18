import { NextResponse } from "next/server";
import { readStore, updateStore, slugify } from "@/lib/store";
import { isAdminAuthenticated } from "@/lib/auth";
import { publicProduct } from "@/lib/products";
import { normalizeOptions } from "@/lib/variants";

function sanitizeVariants(rawVariants) {
  if (!Array.isArray(rawVariants)) return [];
  return rawVariants.map((v, i) => ({
    id: v.id || `v${Date.now()}-${i}`,
    values: v.values || {},
    price: v.price === "" || v.price == null ? null : Number(v.price),
    stock: Number(v.stock) || 0,
    image: v.image || "",
  }));
}

export async function GET(_request, { params }) {
  const { id } = await params;
  const data = await readStore();
  const product = data.products.find((p) => p.id === id || p.slug === id);
  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  const authed = await isAdminAuthenticated();
  return NextResponse.json(authed ? product : publicProduct(product));
}

export async function PUT(request, { params }) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

    const updated = await updateStore((data) => {
      const idx = data.products.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      const existing = data.products[idx];

      let slug = existing.slug;
      if (body.name && body.name !== existing.name) {
        const baseSlug = slugify(body.name);
        slug = baseSlug;
        let i = 2;
        while (data.products.some((p) => p.slug === slug && p.id !== id)) {
          slug = `${baseSlug}-${i++}`;
        }
      }

      const next = {
        ...existing,
        ...body,
        slug,
        price: body.price != null ? Number(body.price) : existing.price,
        compareAtPrice:
          body.compareAtPrice === "" || body.compareAtPrice == null
            ? null
            : Number(body.compareAtPrice),
        stock: body.stock != null ? Number(body.stock) : existing.stock,
        cost: body.cost != null ? Number(body.cost) : existing.cost || 0,
        images: Array.isArray(body.images) ? body.images : existing.images,
        options: body.options !== undefined ? normalizeOptions(body.options) : existing.options || [],
        variants:
          body.variants !== undefined ? sanitizeVariants(body.variants) : existing.variants || [],
        id: existing.id,
      };
      data.products[idx] = next;
      return next;
    });

    if (!updated) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "No se pudo guardar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { id } = await params;

    const removed = await updateStore((data) => {
      const idx = data.products.findIndex((p) => p.id === id);
      if (idx === -1) return false;
      data.products.splice(idx, 1);
      return true;
    });

    if (!removed) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "No se pudo eliminar el producto" },
      { status: 500 }
    );
  }
}
