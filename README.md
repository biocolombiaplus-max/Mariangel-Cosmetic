# Mariangel Cosmetic — Tienda Online

Landing page + tienda online + panel administrativo para **Mariangel Cosmetic**, construida con Next.js y Tailwind CSS, inspirada en la estética de marcas de belleza juveniles (estilo Bloomshell) y en la paleta de marca (rosa blush → orquídea → morado profundo).

## ¿Qué incluye?

- **Landing page** con hero rotativo, categorías, productos destacados, banner de promoción, sección "sobre nosotros", galería estilo Instagram, testimonios y CTA de WhatsApp.
- **Tienda (`/tienda`)** con filtro por categoría, buscador y orden por precio/destacados.
- **Ficha de producto (`/producto/[slug]`)** con galería, selector de cantidad, "agregar al carrito" y "comprar ya por WhatsApp".
- **Carrito** persistente (localStorage) con checkout que arma automáticamente el mensaje de WhatsApp con el resumen del pedido.
- **Panel administrativo (`/admin`)**, protegido con contraseña, estilo Shopify:
  - CRUD de productos con subida de fotos, con un campo de **costo interno** (oculto para tus clientes) para calcular tu ganancia real.
  - **Variantes estilo Shopify** (color, tamaño, etc.): defines las opciones y sus valores, el sistema genera las combinaciones, y ajustas precio/stock/foto por variante. En la tienda, la clienta elige la variante y el precio, la foto y el stock se actualizan automáticamente.
  - Editor de contenido de la landing por secciones (portada/hero, promoción, "sobre nosotros", galería de Instagram, testimonios, pie de página) y datos generales (logo, nombre, WhatsApp, Instagram).
  - **Dashboard de resumen** con ingresos confirmados, ganancia estimada, valor en negociación, tasa de cierre y pedidos recientes.
  - **CRM de pedidos estilo Kommo** (`/admin/pedidos`): tablero Kanban por etapas (Nuevo, Contactado, En negociación, Ganado, Perdido) con tarjetas que se arrastran entre columnas, notas de seguimiento, etiquetas, y un botón directo para escribirle por WhatsApp a cada clienta (remarketing).
- **Captura de leads en el checkout:** como no usamos la API oficial de WhatsApp Business (requiere aprobación de Meta), antes de abrir WhatsApp se le pide nombre y número a la clienta — así cada pedido por WhatsApp queda registrado en el CRM en vez de perderse en el chat.

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

- En **local** (o cualquier host con disco persistente, como un VPS/Railway/Render), el catálogo y contenido viven en `data/store.json` y las imágenes subidas en `public/uploads/`.
- En **Vercel**, el proyecto detecta automáticamente si hay un Blob Store conectado (variable `BLOB_READ_WRITE_TOKEN`) y en ese caso guarda ahí el catálogo/contenido y las imágenes subidas, para que persistan entre despliegues. Ver sección "Desplegar en Vercel" abajo — no requiere tocar código.
- Los productos de ejemplo usan imágenes ilustrativas generadas en `public/products/` y `public/brand/` (ver `scripts/gen-placeholders.mjs`). Reemplázalas por fotos reales desde el panel administrativo (Productos → editar → subir fotos) y desde Contenido de la tienda (portada, promoción, Instagram, logo).

## Desplegar en Vercel (paso a paso)

1. **Sube el proyecto a GitHub** (si ya está en un repo, salta este paso).
2. En [vercel.com](https://vercel.com), inicia sesión con tu cuenta de GitHub.
3. **Add New… → Project** y selecciona el repositorio `Mariangel-Cosmetic`.
4. En "Configure Project" deja el framework en **Next.js** (se detecta solo) y dale a **Deploy** — esto te da ya una primera URL pública (ej. `mariangel-cosmetic.vercel.app`).
5. Antes de usar el panel admin en producción, agrega las variables de entorno en **Project → Settings → Environment Variables**:
   - `ADMIN_PASSWORD` → la contraseña que quieras para entrar a `/admin`.
   - `ADMIN_SECRET` → un texto largo y aleatorio (ej. generado con `openssl rand -hex 32`).
6. **Conecta el almacenamiento (para que el admin funcione de verdad):** en el proyecto en Vercel ve a **Storage → Create Database/Store → Blob** y conéctalo a este proyecto. Vercel agrega automáticamente la variable `BLOB_READ_WRITE_TOKEN`.
7. Ve a **Deployments** y dale **Redeploy** al último despliegue (para que tome las variables nuevas).
8. Entra a `https://tu-proyecto.vercel.app/admin`, inicia sesión con tu `ADMIN_PASSWORD` y ya puedes agregar productos, fotos y editar el contenido — quedará guardado en Vercel Blob y sobrevive a futuros despliegues.

Cada vez que hagas `git push` a la rama conectada, Vercel vuelve a desplegar automáticamente.

## WhatsApp Business

El número de WhatsApp (`3005089954`) se gestiona desde **Contenido de la tienda → General** en el panel administrativo, en formato internacional sin espacios ni `+` (ej. `573005089954`).

## Logo

Se incluye un logo por defecto recreado en SVG/CSS a partir de la identidad de marca. Puedes subir el logo real desde **Contenido de la tienda → General → Logo de la tienda** en el panel administrativo.

## CRM y ganancia (costo interno)

- Cada producto tiene un campo **"Costo interno (COP)"** en el formulario de admin, marcado con 🔒: solo se ve en el panel, nunca se expone en la tienda ni en las respuestas públicas de la API.
- El dashboard (`/admin`) calcula la **ganancia estimada** restando ese costo al precio de venta de los pedidos marcados como "Ganado".
- El **CRM de pedidos** (`/admin/pedidos`) captura automáticamente cada checkout por WhatsApp como una tarjeta en la etapa "Nuevo". Desde ahí puedes moverla de etapa, agregar notas de seguimiento, etiquetas (VIP, Recompra, etc.) y escribirle directo por WhatsApp para remarketing — todo sin depender de la API oficial de WhatsApp Business.
