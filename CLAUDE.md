@AGENTS.md

# todonatacion.net

Migración de la web WordPress de todonatacion.net (GeneratePress + AAWP) a Next.js. Español, mercado España. Afiliación principal: Amazon.es (tag `todonatacion-21`).

## Reglas

- **Las URLs no cambian.** Cada MDX declara su URL exacta en `path` (con barra final). `trailingSlash: true`.
- **Nunca escribas enlaces de afiliado a mano.** Los productos viven en `content/products/<id>.json` y el contenido los usa con `<ProductBox id>`, `<ProductGrid ids>`, `<ProductList ids>` y `<ProductTable ids ribbons rows>`. Los enlaces se generan en `lib/affiliates/links.ts`.
- **Precios:** solo se muestran si `checkedAt` tiene menos de 24 h (condición de Amazon). Sin eso, el botón dice "Ver precio en Amazon".
- Amazon se enlaza directo con `rel="sponsored nofollow"`; las otras tiendas pasan por `/go/<producto>/<tienda>/`.
- Las URLs antiguas que hay que redirigir van en `redirects.json` (lo usan `next.config.ts` y la migración).

## Estructura

- `content/pages/**.mdx`, `content/posts/<categoria>/<slug>.mdx`, `content/categories.json`, `content/products/*.json`
- `app/[...slug]/page.tsx`: un único catch-all para páginas, posts y categorías (WordPress los mezcla en el mismo nivel)
- `components/affiliate/`, `components/content/` (MDX, embeds, formularios), `components/tools/` (calculadoras)
- `lib/affiliates/` (tipos, catálogo, enlaces, precios, adaptadores por tienda), `lib/content.ts`, `lib/tools.ts`
- `scripts/migrate-wp.mts`: `npm run migrate` regenera `content/` desde la REST API pública de WordPress (sobrescribe `content/pages`, `posts` y `products`)
