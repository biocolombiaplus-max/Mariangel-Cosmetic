# Mariangel Cosmetic — Tienda Online

Landing page + tienda online + panel administrativo para **Mariangel Cosmetic**, construida con Next.js y Tailwind CSS, inspirada en la estética de marcas de belleza juveniles (estilo Bloomshell) y en la paleta de marca (rosa blush → orquídea → morado profundo).

## ¿Qué incluye?

- **Landing page** con hero rotativo, categorías, productos destacados, banner de promoción, sección "sobre nosotros", galería estilo Instagram, testimonios y CTA de WhatsApp.
- **Tienda (`/tienda`)** con filtro por categoría, buscador y orden por precio/destacados.
- **Ficha de producto (`/producto/[slug]`)** con galería, selector de cantidad, "agregar al carrito" y "comprar ya por WhatsApp".
- **Carrito** persistente (localStorage) con checkout que arma automáticamente el mensaje de WhatsApp con el resumen del pedido.
- **Panel administrativo (`/admin`)**, protegido con contraseña, estilo Shopify:
  - CRUD de productos con subida de fotos.
  - Editor de contenido de la landing por secciones (portada/hero, promoción, "sobre nosotros", galería de Instagram, testimonios, pie de página) y datos generales (logo, nombre, WhatsApp, Instagram).

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para la tienda y [http://localhost:3000/admin](http://localhost:3000/admin) para el panel administrativo.

### Acceso al panel administrativo

La contraseña se configura en `.env.local`:

```
ADMIN_PASSWORD=Mariangel2024
ADMIN_SECRET=cambia-este-secreto-en-produccion-por-uno-largo-y-aleatorio
```

**Importante:** cambia `ADMIN_PASSWORD` y `ADMIN_SECRET` antes de publicar la tienda en producción.

## Datos y almacenamiento

- El catálogo y el contenido de la landing viven en `data/store.json` (se lee/escribe desde el servidor).
- Las imágenes subidas desde el panel administrativo se guardan en `public/uploads/`.
- Los productos de ejemplo usan imágenes ilustrativas generadas en `public/products/` y `public/brand/` (ver `scripts/gen-placeholders.mjs`). Reemplázalas por fotos reales desde el panel administrativo (Productos → editar → subir fotos) y desde Contenido de la tienda (portada, promoción, Instagram, logo).

⚠️ **Nota sobre despliegue:** si despliegas en una plataforma serverless con sistema de archivos efímero (por ejemplo Vercel), tanto `data/store.json` como `public/uploads/` se reiniciarán en cada despliegue. Para producción real se recomienda migrar a una base de datos (ej. Postgres/Supabase) y a un servicio de almacenamiento de imágenes (ej. Vercel Blob, S3, Cloudinary). Para un VPS o servidor Node persistente (Railway, Render, un droplet, etc.) funciona tal cual.

## WhatsApp Business

El número de WhatsApp (`3005089954`) se gestiona desde **Contenido de la tienda → General** en el panel administrativo, en formato internacional sin espacios ni `+` (ej. `573005089954`).

## Logo

Se incluye un logo por defecto recreado en SVG/CSS a partir de la identidad de marca. Puedes subir el logo real desde **Contenido de la tienda → General → Logo de la tienda** en el panel administrativo.
