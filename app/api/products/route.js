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

export async function GET() {
  const data = await readStore();
  const authed = await isAdminAuthenticated();
  const products = authed ? data.products : data.products.map(publicProduct);
  return NextResponse.json(products);
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
        cost: body.cost ? Number(body.cost) : 0,
        options: normalizeOptions(body.options),
        variants: sanitizeVariants(body.variants),
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
