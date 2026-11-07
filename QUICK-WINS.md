# Quick wins — checklist

Sacado de `todonatacion-plan-maximizacion.md` (sección 2), aplicado a la versión Next.js. Ordenado de más fácil a más difícil de implementar.

Leyenda: `[x]` hecho · `[ ]` pendiente · 🔒 bloqueado por una decisión o dato que falta

> En la web WordPress actual (producción) estos fallos siguen ahí hasta que se publique la versión Next.js o se corrijan también allí.

**Comprobación automática:** `npm run build && npm run audit` revisa todo el HTML generado (enlaces internos, URLs mal formadas, imágenes, enlaces de Amazon). Último resultado: 103 páginas · 801 enlaces a Amazon · 0 errores · 0 avisos.

## 1. QW2 — Rutas de imagen `///wp-content/` → `/wp-content/`

- [x] Ninguna imagen del contenido, de las fichas de producto ni de las imágenes destacadas usa `///` ni `https:///` (lo corrige la migración)
- [x] Todas las imágenes locales referenciadas existen en `public/` (227 imágenes)
- [x] Imágenes destacadas (`og:image`) de 32 entradas descargadas: apuntaban a `https://www.todonatacion.net/…` y se habrían roto al cambiar el dominio. La auditoría comprueba las 71 páginas con `og:image`

## 2. QW1 — Enlaces internos rotos `https:/x`

- [x] Ningún enlace del contenido usa `https:/x` (lo corrige la migración)
- [x] Los 8 enlaces de la home y las 16 tarjetas del hub `/material-de-natacion/` llevan a sus páginas
- [x] Las galerías de tarjetas (hub de material y 11 páginas de producto) se ven como tarjetas, no como texto roto (`<CardGrid>`)
- [x] Footer: contacto, aviso legal y cookies enlazados correctamente
- [x] Recuperado el widget del footer que enlazaba a las guías de compra (no estaba en el contenido y se había perdido en la migración)
- [x] Enlaces a URLs antiguas reescritos a su destino final (`redirects.json`)
- [x] Auditoría automática (`npm run audit`) que falla si vuelve a aparecer un enlace roto

## 3. QW5 — Etiqueta de afiliado en todos los enlaces

- [x] Los 801 enlaces a Amazon de todo el sitio van a amazon.es con `tag=todonatacion-21` y `rel="sponsored"` (no solo los de los 10 artículos top)
- [x] Ningún enlace a amazon.de ni a otros países
- [x] Enlaces cortos `amzn.to`: uno de `/tablas/` (ZAOSU Pull Kick) llevaba el tag **`todotriatlon-21`**; los dos pasan a enlace directo con nuestro tag
- [ ] 🔒 Productos descatalogados: no se puede comprobar sin acceso a la API de Amazon (o revisión manual)

## 4. QW4 — Títulos SEO limpios

- [x] Quitados `▷ ► ᐈ ✅ 🏊 ✨ >>`, los corchetes `【】`, el año (`2026`, `【2021】`) y las palabras en mayúsculas (`lib/seo-text.ts`)
- [x] Quitado el sufijo de marca duplicado; la plantilla añade " - Todo Natación" solo a títulos de hasta 45 caracteres
- [x] Quitada la misma decoración de las meta descriptions (incluido el reclamo `llll➤` del inicio, en 7 páginas)
- [x] Home: «Todo Natación: técnica, entrenamientos y material para nadar» (antes «▷ 【TodoNatacion】- Mejor blog de natación de 2026»)
- [x] Aplicado en el script de migración, para que no se pierda al volver a ejecutarlo

## 5. QW3 — Enlaces legales y privacidad

- [x] Footer enlaza contacto, aviso legal y cookies (en WordPress, el enlace «Política de Privacidad» llevaba a la página de cookies)
- [x] Página `/politica-de-privacidad/` creada (RGPD/LOPDGDD) y enlazada en el pie
- [x] Aviso legal reescrito: email `info@todonatacion.net`, sin la LOPD de 1999, sin las referencias a triatlón/solotriatlon.com y con la cláusula de afiliado
- [ ] 🔒 Falta el domicilio del titular, que la LSSI (art. 10) pide en el aviso legal
- [x] El formulario de newsletter enlaza a `/politica-de-privacidad/` en vez de a `#` (la página tiene que existir antes de activarlo)

## 6. QW6 — Un solo formulario de newsletter por página, con copy concreto

- [x] Como máximo un formulario por página (la migración lo garantiza)
- [x] Copy centrado en el lead magnet: «Los 7 errores técnicos que te frenan en natación · Descargar la guía gratis»; el del Programa Técnica, con el suyo propio
- [x] Quitado el CSS de MailPoet que aparecía como texto en la página del descargable
- [ ] 🔒 Proveedor de newsletter (los 190 suscriptores están en MailPoet): sin él, el formulario no se publica (solo se ve en desarrollo)
