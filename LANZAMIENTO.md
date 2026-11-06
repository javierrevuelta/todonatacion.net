# Lanzamiento — checklist antes de cambiar el DNS

Revisión del 6-11-2026 de https://todonatacion-net.vercel.app/ frente al WordPress en producción.

Leyenda: `[x]` hecho · `[ ]` pendiente · 🔒 necesita una decisión o un dato

## Comprobado y correcto

- [x] Las 98 URLs del sitemap de WordPress existen en Vercel con 200 (las 2 que faltan son páginas internas de MailPoet)
- [x] Canonical de cada página apunta a `https://todonatacion.net/<url>/`; ninguna página con noindex
- [x] 323 enlaces internos e imágenes comprobados en Vercel; 801 enlaces a Amazon con `todonatacion-21`
- [x] Redirecciones antiguas (`redirects.json`), sitemaps de Yoast y `/feed/` funcionan
- [x] `robots.txt` y `sitemap.xml` correctos

## Corregido en esta revisión

- [x] 3 imágenes con «ñ» daban 403 en Vercel (nombre en Unicode NFD): contenido normalizado a NFC, la migración lo hace siempre y `npm run audit` lo detecta
- [x] Página 404 propia en español (antes la de Next en inglés)
- [x] Redirecciones para URLs de WordPress fuera del sitemap: paginación (`/blog/page/2/`), etiquetas, autores y feeds de categoría/comentarios

## Bloqueantes

- [x] **Publicidad y analítica** (`lib/tracking.ts`): GTM `GTM-5CFX5MR` (GA4 `G-PJ6NMF5EHR` y píxel de Facebook), AdSense con anuncios automáticos (`ca-pub-3758011133443292`), `ads.txt` y el mismo `dataLayer` de página que WordPress
  - Consent Mode v2 denegado por defecto; el aviso de consentimiento es el de Google (configurado en AdSense → Privacidad y mensajes, ya activo en WordPress), que llega con el script de AdSense. No hacía falta CookieYes: WordPress no tenía banner propio
  - Solo se carga en `todonatacion.net`/`www`; para probarlo en otro dominio, abrir con `?tracking=on`
  - Pie: enlace «Configurar cookies» que reabre el aviso de Google
  - Política de cookies reescrita (la de 2017 decía que navegar era consentir y citaba Safe Harbor) y marcada `manual: true` para que `npm run migrate` no la pise
- [ ] 🔒 **En GTM (lo tiene que hacer el dueño de la cuenta):** el píxel de Facebook instala `_fbp` sin consentimiento (también en WordPress hoy). En GTM → etiqueta del píxel → Configuración de consentimiento → «Requerir consentimiento adicional»: `ad_storage`. Y borrar la etiqueta de Universal Analytics (`UA-4186034-28`), que Google dejó de procesar en 2024
- [ ] Tras el cambio de DNS: comprobar que sale el aviso de Google y que GA4 recibe visitas (Tiempo real)
- [ ] 🔒 **Formularios:** `/contacto/` dice «a través de este formulario» pero no hay formulario; `/descargable-los-7-errores-tecnicos/` y `/programa-tecnica/` salen vacías. Hace falta proveedor de newsletter (190 suscriptores en MailPoet) y un email de contacto
- [ ] 🔒 **Dominio en Vercel:** `todonatacion.net` y `www.todonatacion.net` aún no están añadidos al proyecto (Vercel responde 404 para ese dominio)

## Importante, no bloqueante

- [ ] 🔒 37 comentarios publicados en WordPress no se han migrado
- [ ] 🔒 Página `/politica-de-privacidad/` y email/LOPD del aviso legal (ver `QUICK-WINS.md`)
- [ ] Después del cambio, redirigir `todonatacion-net.vercel.app` al dominio principal (en Vercel → Domains)
- [ ] No borrar el hosting de Hostinger: el correo está allí y WordPress es la fuente de `npm run migrate`

## Cambio de DNS (en Hostinger, nameservers `dns-parking.com`)

Tocar **solo** el registro web; el correo sigue en Hostinger.

| Registro | Ahora | Después |
|---|---|---|
| `@` A | `92.113.16.180`, `92.113.23.60` | el que indique Vercel (normalmente `76.76.21.21`) |
| `@` AAAA | `2a02:4780:…` (2) | **borrar** (si no, el tráfico IPv6 sigue yendo a WordPress) |
| `www` CNAME | `www.todonatacion.net.cdn.hstgr.net` | `cname.vercel-dns.com` (o el que indique Vercel) |
| MX, SPF, DMARC, DKIM (`hostingermail-a/b/c`), `autodiscover` | Hostinger | **no tocar** |
| TXT `google-site-verification` | | **no tocar** (Search Console) |

Antes: bajar el TTL de A/AAAA/www a 300 s unas horas antes. Después: comprobar `https://todonatacion.net/` y `www`, el certificado SSL en Vercel y enviar el sitemap en Search Console.
