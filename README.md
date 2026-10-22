# Mariangel Cosmetic — Tienda Online

Landing page + tienda online + panel administrativo para **Mariangel Cosmetic**, construida con Next.js y Tailwind CSS, inspirada en la estética de marcas de belleza juveniles (estilo Bloomshell) y en la paleta de marca (rosa blush → orquídea → morado profundo).

## ¿Qué incluye?

- **Landing page** con hero rotativo, barra de confianza (envío, asesoría, compra segura, clientas felices), categorías, productos destacados, banner de promoción, sección "Cómo comprar" en 3 pasos, "sobre nosotros", galería estilo Instagram, testimonios con calificación promedio y CTA de WhatsApp.
- **Tienda (`/tienda`)** con filtro por categoría, buscador y orden por precio/destacados.
- **Ficha de producto (`/producto/[slug]`)** con galería, selector de cantidad, "agregar al carrito" y "comprar ya por WhatsApp".
- **Carrito** persistente (localStorage) con checkout que arma automáticamente el mensaje de WhatsApp con el resumen del pedido, un link a la foto de cada producto (WhatsApp no permite adjuntar imágenes reales en un link pre-llenado, así que se incluye el link directo a la foto para verla en un toque) y un aviso de "te faltan $X para domicilio gratis" que nunca interrumpe la compra.
- **Panel administrativo (`/admin`)**, protegido con contraseña, estilo Shopify:
  - CRUD de productos con subida de fotos, con un campo de **costo interno** (oculto para tus clientes) para calcular tu ganancia real.
  - **Formulario de producto estilo Shopify**, organizado por secciones (fotos, título/descripción, precios, variantes, SEO, estado, inventario, organización) con explicaciones de dónde aparece cada campo en la tienda — incluye **SKU**, **etiquetas** (se muestran como insignias en la ficha del producto) y **SEO** (título/descripción personalizados para Google, con vista previa en vivo).
  - **Variantes estilo Shopify** (color, tamaño, etc.): defines las opciones y sus valores, el sistema genera las combinaciones, y ajustas precio/stock/foto por variante. En la tienda, la clienta elige la variante y el precio, la foto y el stock se actualizan automáticamente.
  - Editor de contenido de la landing por secciones (portada/hero, promoción, "sobre nosotros", galería de Instagram, testimonios, pie de página) y datos generales (logo, nombre, WhatsApp, Instagram).
  - **Dashboard de resumen** con ingresos confirmados, ganancia estimada, valor en negociación, tasa de cierre, tráfico de la tienda (visitas de hoy y de los últimos 7 días) y pedidos recientes.
  - **CRM de pedidos estilo Kommo** (`/admin/pedidos`): tablero Kanban por etapas (Nuevo, **Carrito abandonado**, Contactado, En negociación, Ganado, Perdido) con tarjetas que se arrastran entre columnas, notas de seguimiento, etiquetas, y un botón directo para escribirle por WhatsApp a cada clienta (remarketing). Si alguien deja su nombre y WhatsApp en el checkout pero no termina el pedido, queda capturado en "Carrito abandonado" para que puedas recuperarlo — no se pierde. Una venta solo cuenta como ganancia confirmada (y suma a la comisión de Biomarketing) cuando tú mueves la tarjeta a **"Ganado"**, sin importar de qué etapa venga — así un pedido que llegó a WhatsApp pero no se cerró nunca infla tus números.
  - **Comisión Biomarketing** (`/admin/comision`): cada producto se vende con un recargo porcentual configurable (5% por defecto) que se suma automáticamente al precio que define Mariangel — nunca se descuenta de su propia ganancia. El panel muestra la comisión acumulada, el avance del ciclo de pago actual (quincenal o mensual) con fecha de próximo pago, el historial de ciclos y el desglose "tu precio + comisión = precio final" en cada producto.
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

- En **local** (o cualquier host con disco persistente, como un VPS/Railway/Render), el catálogo, el contenido y las imágenes subidas viven en `data/store.json` y `public/uploads/`.
- En **Vercel**, el proyecto usa **Cloudinary** (recomendado) o **Vercel Blob** — lo que esté configurado — para guardar ahí el catálogo/contenido y las imágenes subidas, para que persistan entre despliegues. Ver "Desplegar en Vercel" y "Almacenamiento (Cloudinary, recomendado)" abajo — no requiere tocar código.
- Los productos de ejemplo usan imágenes ilustrativas generadas en `public/products/` y `public/brand/` (ver `scripts/gen-placeholders.mjs`). Reemplázalas por fotos reales desde el panel administrativo (Productos → editar → subir fotos) y desde Contenido de la tienda (portada, promoción, Instagram, logo).

## Desplegar en Vercel (paso a paso)

1. **Sube el proyecto a GitHub** (si ya está en un repo, salta este paso).
2. En [vercel.com](https://vercel.com), inicia sesión con tu cuenta de GitHub.
3. **Add New… → Project** y selecciona el repositorio `Mariangel-Cosmetic`.
4. En "Configure Project" deja el framework en **Next.js** (se detecta solo) y dale a **Deploy** — esto te da ya una primera URL pública (ej. `mariangel-cosmetic.vercel.app`).
5. Antes de usar el panel admin en producción, agrega las variables de entorno en **Project → Settings → Environment Variables**:
   - `ADMIN_PASSWORD` → la contraseña que quieras para entrar a `/admin`.
   - `ADMIN_SECRET` → un texto largo y aleatorio (ej. generado con `openssl rand -hex 32`).
6. **Conecta el almacenamiento (para que el admin funcione de verdad):** sigue la sección siguiente ("Almacenamiento") para conectar Cloudinary — es el camino recomendado.
7. Ve a **Deployments** y dale **Redeploy** al último despliegue (para que tome las variables nuevas).
8. Entra a `https://tu-proyecto.vercel.app/admin`, inicia sesión con tu `ADMIN_PASSWORD` y ya puedes agregar productos, fotos y editar el contenido — quedará guardado y sobrevive a futuros despliegues.

Cada vez que hagas `git push` a la rama conectada, Vercel vuelve a desplegar automáticamente.

## Almacenamiento (Cloudinary, recomendado)

El catálogo, el contenido de la landing y las fotos que subas necesitan guardarse en algún lado persistente en Vercel. Hay dos opciones:

- **Cloudinary** (recomendado): un plan gratuito pensado justamente para tiendas — 25GB de almacenamiento y 25GB de tráfico al mes — y es lo que usa este proyecto para **todo**: fotos de productos y el catálogo/contenido completo.
- **Vercel Blob**: funciona, pero es gratis solo hasta cierto límite de almacenamiento/tráfico, y si lo superas (o falla el método de pago) tu Blob Store puede quedar **suspendido** — verás errores como `Vercel Blob: This store has been suspended.` al subir una foto o al guardar cambios.

**Para conectar Cloudinary:**

1. Crea una cuenta gratis en [cloudinary.com](https://cloudinary.com).
2. En tu **Dashboard** de Cloudinary (o en **Settings → API Keys**) copia: **Cloud name**, **API Key** y **API Secret**.
3. En Vercel, ve a tu proyecto → **Settings → Environment Variables** y agrega (marca Production, Preview y Development):
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Ve a **Deployments** → en el despliegue más reciente, **⋯ → Redeploy**.
5. Entra al panel admin y prueba subir una foto o guardar un producto — debería funcionar sin errores.

Una vez configurado, Cloudinary toma prioridad automáticamente sobre Vercel Blob (no hace falta desconectar Blob si ya lo tenías). Si en el futuro Cloudinary llegara a fallar momentáneamente, el sistema nunca sobrescribe datos a ciegas: reintenta, y si no puede confirmar el estado real, avisa con un error claro en vez de arriesgar tu información.

**¿Ya tienes el error de "store suspended" en Vercel Blob?** Conectar Cloudinary (arriba) resuelve el problema sin depender de Blob en absoluto — no necesitas arreglar la suspensión de Blob para seguir usando tu tienda.

## WhatsApp Business

El número de WhatsApp (`3005089954`) se gestiona desde **Contenido de la tienda → General** en el panel administrativo, en formato internacional sin espacios ni `+` (ej. `573005089954`).

## Analíticas de campaña (embudo estilo Shopify)

El panel (`/admin/analiticas`) muestra el embudo completo de tu tienda, con conteo y % de conversión en cada paso: visitas → vieron un producto → agregaron al carrito → iniciaron el pedido → dejaron sus datos → compra confirmada. También muestra visitas por día y de dónde viene el tráfico (según el `utm_source`/`utm_campaign` del link que usó cada visitante). Para que el origen se vea en la tabla de "¿De dónde viene el tráfico?", usa un link con parámetros UTM en tus anuncios — ver la siguiente sección.

Estos datos son propios de tu tienda (no dependen de que el píxel de Meta esté bien configurado) y se guardan en un almacenamiento liviano e independiente del catálogo, así que nunca afectan la velocidad de guardar productos o pedidos.

**Qué URL poner en el anuncio:** en "Sitio web" pon la página a la que quieres llevar a la clienta (ej. `https://tu-dominio.vercel.app/` para la tienda completa, o `https://tu-dominio.vercel.app/producto/labial-mate-rose` si el anuncio es de ese producto específico). Luego, en el campo **"Parámetros de URL"** del anuncio (no en la URL principal), agrega:

```
utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

Meta rellena automáticamente el nombre real de la campaña y del anuncio en cada clic — así cada visita queda identificada en `/admin/analiticas` con la campaña y el anuncio exactos de donde vino.

## Catálogo para Meta Ads (miniaturas de productos en los anuncios)

La tienda publica su catálogo completo en `/api/feed` (CSV público, sin login) con el formato que exige **Meta Commerce Manager**: id, título, descripción, disponibilidad, precio final (con el recargo de Biomarketing ya incluido), link al producto y foto. Para que aparezcan las miniaturas del catálogo debajo de tus anuncios (como en las tiendas grandes):

1. En [Meta Commerce Manager](https://business.facebook.com/commerce/), crea un catálogo (o usa uno existente) y conéctalo a tu Business Manager.
2. En **Agregar artículos → Usar fuente de datos → Programar una fuente de datos**, pega la URL `https://tu-dominio.vercel.app/api/feed` y programa que se actualice todos los días.
3. Conecta ese catálogo a tu píxel (en Events Manager → tu conjunto de datos → Catálogos).
4. Al crear el anuncio, usa el objetivo/formato **"Ventas del catálogo"** o un anuncio de **"Colección"** — ahí es donde Meta muestra las miniaturas de productos debajo del anuncio principal. Un anuncio de imagen/video normal (como el que ya tienes) no las muestra por sí solo, aunque el catálogo esté conectado.

## Domicilio gratis (umbral configurable)

En **Contenido de la tienda → General → "Domicilio gratis desde"** defines el monto a partir del cual el domicilio es gratis (ej. `120000`). El carrito y el checkout muestran automáticamente una barra de progreso con "te faltan $X" o un aviso de "¡domicilio gratis!" una vez alcanzado — nunca bloquea ni interrumpe la compra. Déjalo en `0` para desactivarlo.

## Logo

Se incluye un logo por defecto recreado en SVG/CSS a partir de la identidad de marca. Puedes subir el logo real desde **Contenido de la tienda → General → Logo de la tienda** en el panel administrativo.

## CRM y ganancia (costo interno)

- Cada producto tiene un campo **"Costo interno (COP)"** en el formulario de admin, marcado con 🔒: solo se ve en el panel, nunca se expone en la tienda ni en las respuestas públicas de la API.
- El dashboard (`/admin`) calcula la **ganancia estimada** restando ese costo al precio de venta de los pedidos marcados como "Ganado" — esta ganancia es siempre la de Mariangel, sin incluir la comisión de Biomarketing (ver abajo).
- El **CRM de pedidos** (`/admin/pedidos`) captura automáticamente cada checkout por WhatsApp como una tarjeta en la etapa "Nuevo". Desde ahí puedes moverla de etapa, agregar notas de seguimiento, etiquetas (VIP, Recompra, etc.) y escribirle directo por WhatsApp para remarketing — todo sin depender de la API oficial de WhatsApp Business.

## Precio final y comisión de Biomarketing

- El precio que se define en cada producto es el **precio base de Mariangel**. La tienda muestra y cobra un **precio final** que es ese precio más un recargo porcentual (configurable en **Comisión Biomarketing → Comisión por producto**, 5% por defecto) — el recargo se suma, nunca se descuenta del precio base, así que la ganancia de Mariangel nunca se ve afectada.
- El formulario de cada producto muestra el desglose completo: tu precio → + comisión Biomarketing → precio final en la tienda, y por separado tu ganancia real (precio base − costo interno).
- El panel **Comisión Biomarketing** (`/admin/comision`) sigue esa comisión por ciclos de pago (quincenal o mensual), con fecha del próximo pago, historial de ciclos anteriores y el detalle de qué pedido aportó cuánto.

## Tráfico de la tienda y Meta Pixel

- El dashboard (`/admin`) muestra cuántas visitantes únicos (por sesión de navegador) entraron hoy y en los últimos 7 días — útil para ver el impacto de una campaña de anuncios en tiempo real, sin depender de otra herramienta.
- Para medir y optimizar una campaña de Meta Ads (Facebook/Instagram) de verdad, conecta tu **Meta Pixel**: pega el ID de tu píxel en **Contenido de la tienda → General → Meta Pixel ID** y guarda — no requiere tocar código ni volver a publicar la tienda. Mientras el campo esté vacío, no se carga nada de Meta en la tienda.
- Una vez activado, el píxel registra automáticamente `PageView`, y además `ViewContent` (al ver un producto), `AddToCart` (al agregar al carrito), `InitiateCheckout` (al abrir el checkout) y `Lead` (al enviar un pedido por WhatsApp) — nunca `Purchase`, ya que un pedido por WhatsApp es un lead calificado, no un pago confirmado.
