import { NextResponse } from "next/server";
import { readStore, updateStore, slugify } from "@/lib/store";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const data = await readStore();
  return NextResponse.json(data.products);
}

export async function POST(request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.name || !body.category || body.price == null) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const product = await updateStore((data) => {
      const baseSlug = slugify(body.name);
      let slug = baseSlug;
      let i = 2;
      while (data.products.some((p) => p.slug === slug)) {
        slug = `${baseSlug}-${i++}`;
      }

      const newProduct = {
        id: `p${Date.now()}`,
        slug,
        name: body.name,
        category: body.category,
        price: Number(body.price) || 0,
        compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null,
        description: body.description || "",
        images: Array.isArray(body.images) ? body.images : [],
        stock: Number(body.stock) || 0,
        featured: Boolean(body.featured),
        active: body.active !== false,
        rating: body.rating ? Number(body.rating) : 5,
      };
      data.products.unshift(newProduct);
      return newProduct;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "No se pudo crear el producto" },
      { status: 500 }
    );
  }
}
