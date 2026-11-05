/**
 * Migra el contenido público de WordPress (REST API) a:
 *   content/pages/**.mdx, content/posts/<categoria>/<slug>.mdx,
 *   content/categories.json, content/products/<id>.json
 *   public/wp-content/uploads/** (imágenes, misma ruta que en WordPress)
 *
 * Los bloques de AAWP se convierten en <ProductBox>, <ProductGrid>,
 * <ProductList> y <ProductTable>, y cada ASIN pasa a una ficha de producto.
 *
 * Uso: npm run migrate [-- --no-images]
 */
import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import TurndownService from "turndown";
// @ts-expect-error: el paquete no publica tipos
import { gfm } from "turndown-plugin-gfm";
import matter from "gray-matter";
import { cleanSeoDescription, cleanSeoTitle } from "../lib/seo-text";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

const SITE = "https://todonatacion.net";
const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const DOWNLOAD_IMAGES = !process.argv.includes("--no-images");

type WpItem = {
  id: number;
  date: string;
  modified: string;
  link: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content: { rendered: string };
  categories?: number[];
  tags?: number[];
  parent?: number;
  menu_order?: number;
  yoast_head_json?: {
    title?: string;
    description?: string;
    robots?: { index?: string };
    og_image?: { url: string }[];
  };
};
type WpTerm = { id: number; name: string; slug: string; count: number; description: string; link: string };

type MigratedProduct = {
  id: string;
  name: string;
  brand?: string;
  category?: string;
  image?: string;
  features: string[];
  pros: string[];
  cons: string[];
  offers: { merchant: "amazon-es"; externalId: string; priceCents: null; currency: "EUR"; available: true; prime?: boolean; checkedAt: null }[];
};

// ---------------------------------------------------------------- utilidades

async function fetchAll<T>(endpoint: string, fields: string): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; ; page++) {
    const url = `${SITE}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}&_fields=${fields}`;
    const res = await fetch(url, { headers: { "User-Agent": "todonatacion-migrator" } });
    if (!res.ok) throw new Error(`${url} → ${res.status}`);
    out.push(...((await res.json()) as T[]));
    if (page >= Number(res.headers.get("x-wp-totalpages") ?? 1)) return out;
  }
}

function decode(html: string): string {
  return cheerio.load(`<i>${html}</i>`)("i").text().trim();
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function urlPath(link: string): string {
  return new URL(link).pathname; // siempre con barra final en WordPress
}

/** Normaliza enlaces internos: https://todonatacion.net/x, https:/x (roto en WP) → /x */
function normalizeHref(href: string): string {
  if (/^(https?:)?\/\/\/+/.test(href)) return href.replace(/^(https?:)?\/+/, "/"); // ///x y https:///x (también rotos)
  if (/^https?:\/[^/]/.test(href)) return href.replace(/^https?:\//, "/");
  const site = href.match(/^https?:\/\/(?:www\.)?todonatacion\.net(?=\/|$)/);
  if (site) return href.slice(site[0].length) || "/";
  return href;
}

/** Redirecciones heredadas de WordPress: se aplican también a los enlaces del contenido. */
const legacyRedirects: { source: string; destination: string }[] = JSON.parse(
  await fs.readFile(path.join(ROOT, "redirects.json"), "utf8"),
);
const redirectMap = new Map(legacyRedirects.map((r) => [r.source, r.destination]));

/**
 * Enlaces cortos amzn.to del contenido, resueltos a mano a su ASIN. Así pasan
 * por el componente de enlace y llevan nuestro tag (3GZ3egx llevaba el de
 * todotriatlon-21). Uno nuevo sin resolver lo marca `npm run audit`.
 */
const AMZN_SHORTLINKS: Record<string, string> = {
  "2KsO4ae": "B06W53KRG6",
  "3GZ3egx": "B07Z7SSXV8",
};

/** Títulos SEO que la limpieza automática no deja bien. */
const SEO_TITLE_OVERRIDES: Record<string, string> = {
  "/": "Todo Natación: técnica, entrenamientos y material para nadar",
  "/estilos-natacion/crol-estilo-libre-natacion/": "Nadar a Crol o Estilo Libre: Técnica, Errores y Ejercicios",
};

const jsx = (v: unknown) => `{${JSON.stringify(v)}}`;

// ------------------------------------------------------------- productos

const products = new Map<string, MigratedProduct>(); // por ASIN
const usedIds = new Set<string>();
const images = new Set<string>();

function productIdFor(asin: string, title: string): string {
  const existing = products.get(asin);
  if (existing) return existing.id;
  let id = slugify(title).split("-").slice(0, 6).join("-") || asin.toLowerCase();
  if (usedIds.has(id)) id = `${id}-${asin.toLowerCase()}`;
  usedIds.add(id);
  return id;
}

function upsertProduct(input: {
  asin: string;
  title: string;
  image?: string;
  features?: string[];
  prime?: boolean;
  category?: string;
}): string {
  const id = productIdFor(input.asin, input.title);
  const prev = products.get(input.asin);
  if (prev) {
    // Conserva el dato más rico entre apariciones.
    if (input.title.length > prev.name.length) prev.name = input.title;
    if (!prev.image && input.image) prev.image = input.image;
    if (input.features?.length && prev.features.length === 0) prev.features = input.features;
    return id;
  }
  products.set(input.asin, {
    id,
    name: input.title,
    brand: input.title.split(/\s+/)[0]?.replace(/[^\p{L}\p{N}]/gu, "") || undefined,
    category: input.category,
    image: input.image?.replace(/\._SL\d+_\./, "._SL300_."),
    features: input.features ?? [],
    pros: [],
    cons: [],
    offers: [
      {
        merchant: "amazon-es",
        externalId: input.asin,
        priceCents: null,
        currency: "EUR",
        available: true,
        ...(input.prime ? { prime: true } : {}),
        checkedAt: null,
      },
    ],
  });
  return id;
}

const asinFromHref = (href?: string) => href?.match(/amazon\.[a-z.]+\/(?:dp|gp\/product|product-reviews)\/([A-Z0-9]{10})/)?.[1];

/** Convierte un contenedor .aawp en el JSX del componente equivalente. */
function convertAawp($: cheerio.CheerioAPI, el: Element, category: string): string {
  const $el = $(el);

  const table = $el.find(".aawp-tb--desktop").first();
  if (table.length) {
    type Col = { asin?: string; title?: string; image?: string; ribbon?: string; cells: Map<string, string> };
    const cols = new Map<number, Col>();
    table.find(".aawp-tb__row").each((_, row) => {
      const label = $(row).find(".aawp-tb__head").text().replace(/\s+/g, " ").trim();
      $(row)
        .find(".aawp-tb__data")
        .each((_, cell) => {
          const n = Number(($(cell).attr("class") ?? "").match(/aawp-tb-product-(\d+)/)?.[1] ?? -1);
          if (n < 0) return;
          const col: Col = cols.get(n) ?? { cells: new Map() };
          cols.set(n, col);
          $(cell).find("a[href]").each((_, a) => {
            col.asin ??= asinFromHref($(a).attr("href"));
          });
          const ribbon = $(cell).find(".aawp-tb-ribbon").text().trim();
          if (ribbon) col.ribbon = ribbon;
          const title = $(cell).find(".aawp-tb-product-data-title").text().trim();
          if (title) col.title = title;
          const img = $(cell).find("img").attr("src");
          if (img && img.includes("media-amazon")) col.image ??= img;
          const text = $(cell).text().replace(/\s+/g, " ").trim();
          if (text) col.cells.set(label, text);
        });
    });
    const ordered = [...cols.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, c]) => c)
      .filter((c, i, all) => c.asin && all.findIndex((o) => o.asin === c.asin) === i);
    const ids = ordered.map((c) => upsertProduct({ asin: c.asin!, title: c.title ?? c.asin!, image: c.image, category }));
    // Columnas que dependen de datos de Amazon (precio, estrellas, Prime) las calcula el componente.
    const skip = /^(imagen|nombre|t[ií]tulo|precio|prime|ver precio|ver oferta|m[aá]s informaci[oó]n|opiniones|valoraci[oó]n(es)?)$/i;
    const labels = [...new Set(ordered.flatMap((c) => [...c.cells.keys()]))].filter((l) => l && !skip.test(l));
    const rows = labels.map((label) => ({ label, values: ordered.map((c) => c.cells.get(label) ?? "") }));
    const ribbons = ordered.map((c) => c.ribbon ?? null);
    return `<ProductTable ids=${jsx(ids)}${ribbons.some(Boolean) ? ` ribbons=${jsx(ribbons)}` : ""}${rows.length ? ` rows=${jsx(rows)}` : ""} />`;
  }

  const items = $el.find(".aawp-product").toArray();
  if (!items.length) return "";
  const parsed = items.map((p) => {
    const $p = $(p);
    const asin = $p.attr("data-aawp-product-asin")!;
    const features = $p.find(".aawp-product__description li").toArray().map((li) => $(li).text().trim()).filter(Boolean);
    const teaser = $p.find(".aawp-product__teaser").text().trim();
    const id = upsertProduct({
      asin,
      title: decode($p.attr("data-aawp-product-title") ?? asin),
      image: $p.find("img.aawp-product__image").attr("src"),
      features: features.length ? features : teaser ? [teaser] : [],
      prime: $p.find(".aawp-check-prime").length > 0,
      category,
    });
    const cls = $p.attr("class") ?? "";
    const kind = cls.includes("--list") ? "list" : cls.includes("--horizontal") ? "box" : "grid";
    return { id, kind };
  });

  if (parsed.every((p) => p.kind === "box")) return parsed.map((p) => `<ProductBox id="${p.id}" />`).join("\n\n");
  // AAWP repite a veces el mismo ASIN en una lista de más vendidos.
  const ids = [...new Set(parsed.map((p) => p.id))];
  if (parsed.every((p) => p.kind === "list")) return `<ProductList ids=${jsx(ids)} />`;
  return `<ProductGrid ids=${jsx(ids)} />`;
}

// ------------------------------------------------------- HTML → MDX

const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", codeBlockStyle: "fenced", emDelimiter: "*" });
turndown.use(gfm);
turndown.addRule("figure", {
  filter: ["figure"],
  replacement: (content) => `\n\n${content.trim()}\n\n`,
});
turndown.addRule("figcaption", {
  filter: ["figcaption"],
  replacement: (content) => (content.trim() ? `\n\n*${content.trim()}*\n\n` : ""),
});

/** Escapa lo que MDX interpretaría como JSX o expresiones. */
function escapeMdx(md: string): string {
  return md.replace(/[{}<]/g, (c) => ({ "{": "\\{", "}": "\\}", "<": "&lt;" })[c]!);
}

type Converted = { body: string; jsonLd: unknown[]; components: Set<string> };

function htmlToMdx(html: string, category: string): Converted {
  const $ = cheerio.load(html, null, false);
  const tokens: string[] = [];
  const jsonLd: unknown[] = [];
  const components = new Set<string>();
  const token = (value: string, component?: string) => {
    if (component) components.add(component);
    tokens.push(value);
    return `<p>@@TOKEN${tokens.length - 1}@@</p>`;
  };

  // Ruido de plugins
  $("#ez-toc-container, .ez-toc-v2_0_85, .yasr-auto-insert-overall, .yasr-overall-rating, .wp-block-spacer, noscript, style").remove();
  $(".ez-toc-section, .ez-toc-section-end").remove();
  $("script").each((_, s) => {
    const $s = $(s);
    if ($s.attr("type") === "application/ld+json") {
      try {
        jsonLd.push(JSON.parse($s.text()));
      } catch {}
    }
    $s.remove();
  });

  // Acordeones (CoBlocks) → <details>, con el contenido convertido recursivamente
  // Solo los de primer nivel: la recursión se encarga del resto (incluidos sus tokens).
  $("details")
    .toArray()
    .filter((el) => $(el).parents("details").length === 0)
    .forEach((d) => {
      const $d = $(d);
      const summary = $d.children("summary").text().trim();
      $d.children("summary").remove();
      const inner = htmlToMdx($d.html() ?? "", category);
      inner.components.forEach((c) => components.add(c));
      $d.replaceWith(token(`<details>\n<summary>${escapeMdx(summary)}</summary>\n\n${inner.body}\n\n</details>`));
    });
  $(".wp-block-coblocks-accordion").each((_, el) => {
    $(el).replaceWith($(el).html() ?? "");
  });

  // Formularios
  $("form").each((_, f) => {
    const $f = $(f);
    const cls = $f.attr("class") ?? "";
    const id = $f.attr("id");
    let repl = "";
    if (cls.includes("mailpoet")) repl = token(`<Newsletter form="${$f.find('input[name="data[form_id]"]').val()}" />`, "Newsletter");
    else if (cls.includes("wpcf7")) repl = token(`<ContactForm />`, "ContactForm");
    else if (id === "swolfForm") repl = token(`<SwolfCalculator />`, "SwolfCalculator");
    else if (id === "caloriesCalculator") repl = token(`<CaloriesCalculator />`, "CaloriesCalculator");
    const wrapper = $f.closest(".mailpoet_form, .wpcf7");
    (wrapper.length ? wrapper : $f).replaceWith(repl);
  });
  $("#result, #resultadoSWOLF").remove();

  // AAWP
  $(".aawp")
    .toArray()
    .filter((el) => $(el).parents(".aawp").length === 0)
    .forEach((el) => {
      const out = convertAawp($, el, category);
      const names = [...out.matchAll(/<(Product\w+)/g)].map((m) => m[1]);
      names.forEach((n) => components.add(n));
      $(el).replaceWith(out ? token(out) : "");
    });

  // Galerías con enlaces (tarjetas hacia las páginas de producto) → <CardGrid>
  $("figure.wp-block-gallery")
    .toArray()
    .filter((el) => $(el).parents("figure.wp-block-gallery").length === 0)
    .forEach((el) => {
      const items = $(el)
        .find("figure")
        .toArray()
        .filter((f) => $(f).find("img").length > 0)
        .map((f) => {
          const $f = $(f);
          const $img = $f.find("img").first();
          const rawHref = $f.find("a[href]").first().attr("href");
          if (!rawHref) return null;
          const href = normalizeHref(rawHref);
          const image = normalizeHref($img.attr("data-src") ?? $img.attr("src") ?? "").split("?")[0];
          if (image.startsWith("/wp-content/uploads/")) images.add(image);
          const alt = $img.attr("alt")?.trim() ?? "";
          const description = $f.find(".gallery-item-description").text().trim();
          return {
            href: redirectMap.get(href) ?? href,
            title: $f.find(".gallery-item-title").text().trim() || alt.charAt(0).toUpperCase() + alt.slice(1),
            ...(description ? { description } : {}),
            image,
            alt,
          };
        });
      if (!items.length || items.some((i) => !i || !i.title)) return; // galería sin enlaces: se queda como imágenes
      $(el).replaceWith(token(`<CardGrid items=${jsx(items)} />`, "CardGrid"));
    });

  // Vídeos
  $("iframe").each((_, f) => {
    const src = $(f).attr("src") ?? "";
    const yt = src.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]{11})/)?.[1];
    const container = $(f).closest("figure.wp-block-embed");
    const target = container.length ? container : $(f);
    target.replaceWith(yt ? token(`<YouTube id="${yt}" />`, "YouTube") : token(`<Embed src="${src}" />`, "Embed"));
  });

  // Enlaces
  $("a[href]").each((_, a) => {
    const $a = $(a);
    let href = normalizeHref($a.attr("href")!);
    const short = href.match(/^https?:\/\/amzn\.to\/(\w+)/)?.[1];
    const asin = asinFromHref(href) ?? (short ? AMZN_SHORTLINKS[short] : undefined);
    if (/amazon\.de\/gp\/prime/.test(href)) {
      $a.replaceWith($a.html() ?? "");
      return;
    }
    if (asin) href = `https://www.amazon.es/dp/${asin}`; // el tag lo añade el componente de enlace
    href = redirectMap.get(href) ?? href;
    $a.attr("href", href);
  });

  // Imágenes: rutas locales y registro para descarga
  $("img").each((_, img) => {
    const $img = $(img);
    const src = $img.attr("data-src") ?? $img.attr("src") ?? "";
    const local = normalizeHref(src);
    if (local.startsWith("/wp-content/uploads/")) images.add(local.split("?")[0]);
    $img.attr("src", local);
    $img.removeAttr("srcset").removeAttr("sizes").removeAttr("data-src");
  });
  // Galerías con enlaces: también se descarga la imagen grande enlazada
  $("a[href^='/wp-content/uploads/']").each((_, a) => {
    images.add($(a).attr("href")!.split("?")[0]);
  });

  let md = turndown.turndown($.html() as string);
  md = escapeMdx(md);
  md = md.replace(/@@TOKEN(\d+)@@/g, (_, i) => `\n\n${tokens[Number(i)]}\n\n`);
  md = md.replace(/\n{3,}/g, "\n\n").trim();
  return { body: md, jsonLd, components };
}

// -------------------------------------------------------------- escritura

async function writeFile(file: string, data: string) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, data);
}

function frontmatter(item: WpItem, kind: "page" | "post", extra: Record<string, unknown>) {
  const y = item.yoast_head_json ?? {};
  const data: Record<string, unknown> = {
    title: decode(item.title.rendered),
    path: urlPath(item.link),
    type: kind,
    wpId: item.id,
    date: item.date,
    modified: item.modified,
    seoTitle: SEO_TITLE_OVERRIDES[urlPath(item.link)] ?? (y.title ? cleanSeoTitle(decode(y.title)) || undefined : undefined),
    description: cleanSeoDescription(
      y.description ? decode(y.description) : item.excerpt ? decode(item.excerpt.rendered) : "",
    ) || undefined,
    image: y.og_image?.[0]?.url ? normalizeHref(y.og_image[0].url) : undefined,
    noindex: y.robots?.index === "noindex" ? true : undefined,
    ...extra,
  };
  for (const k of Object.keys(data)) if (data[k] === undefined) delete data[k];
  if (typeof data.image === "string" && data.image.startsWith("/wp-content/uploads/")) images.add(data.image);
  return data;
}

async function validateMdx(file: string, source: string, errors: string[]) {
  try {
    await compile(matter(source).content, { remarkPlugins: [remarkGfm] });
  } catch (e) {
    errors.push(`${path.relative(ROOT, file)}: ${(e as Error).message}`);
  }
}

async function downloadImages() {
  const list = [...images];
  let done = 0;
  let failed = 0;
  const queue = [...list];
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let p = queue.shift(); p; p = queue.shift()) {
        const dest = path.join(ROOT, "public", decodeURIComponent(p));
        try {
          await fs.access(dest);
        } catch {
          const res = await fetch(SITE + p);
          if (!res.ok) {
            failed++;
            console.warn(`  ✗ ${p} (${res.status})`);
            continue;
          }
          await fs.mkdir(path.dirname(dest), { recursive: true });
          await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
        }
        done++;
      }
    }),
  );
  console.log(`Imágenes: ${done} ok, ${failed} fallidas`);
}

async function main() {
  const fields = "id,date,modified,link,title,excerpt,content,categories,tags,parent,menu_order,yoast_head_json";
  const [pages, posts, categories, tags] = await Promise.all([
    fetchAll<WpItem>("pages", fields),
    fetchAll<WpItem>("posts", fields),
    fetchAll<WpTerm>("categories", "id,name,slug,count,description,link"),
    fetchAll<WpTerm>("tags", "id,name,slug,count,link"),
  ]);
  console.log(`WordPress: ${pages.length} páginas, ${posts.length} posts, ${categories.length} categorías`);

  await fs.rm(path.join(CONTENT, "pages"), { recursive: true, force: true });
  await fs.rm(path.join(CONTENT, "posts"), { recursive: true, force: true });
  await fs.rm(path.join(CONTENT, "products"), { recursive: true, force: true });

  const catById = new Map(categories.map((c) => [c.id, c]));
  const tagById = new Map(tags.map((t) => [t.id, t]));
  const errors: string[] = [];
  const usage = new Map<string, number>();

  for (const item of [...pages, ...posts]) {
    const kind = item.categories ? "post" : "page";
    const p = urlPath(item.link);
    const segments = p.split("/").filter(Boolean);
    const category = kind === "post" ? (catById.get(item.categories![0])?.slug ?? "blog") : (segments[0] ?? "home");
    const converted = htmlToMdx(item.content.rendered, category);
    const { jsonLd, components } = converted;
    // Un solo formulario de newsletter por página (QW6): se queda el primero.
    let newsletters = 0;
    const body = converted.body.replace(/\n*<Newsletter [^>]*\/>\n*/g, (m) => (newsletters++ === 0 ? m : "\n\n"));
    components.forEach((c) => usage.set(c, (usage.get(c) ?? 0) + 1));

    const extra: Record<string, unknown> =
      kind === "post"
        ? {
            categories: item.categories!.map((id) => catById.get(id)?.slug).filter(Boolean),
            tags: (item.tags ?? []).map((id) => tagById.get(id)?.slug).filter(Boolean),
          }
        : { parent: item.parent || undefined, order: item.menu_order || undefined };
    if (jsonLd.length) extra.jsonLd = jsonLd;

    const file =
      kind === "post"
        ? path.join(CONTENT, "posts", category, `${segments.at(-1)}.mdx`)
        : path.join(CONTENT, "pages", segments.length ? `${segments.join("/")}.mdx` : "index.mdx");
    const source = matter.stringify(`${body}\n`, frontmatter(item, kind, extra));
    await validateMdx(file, source, errors);
    await writeFile(file, source);
  }

  await writeFile(
    path.join(CONTENT, "categories.json"),
    JSON.stringify(
      categories
        .filter((c) => c.slug !== "uncategorized")
        .map((c) => ({ slug: c.slug, name: decode(c.name), description: decode(c.description), count: c.count })),
      null,
      2,
    ) + "\n",
  );

  for (const product of products.values()) {
    await writeFile(path.join(CONTENT, "products", `${product.id}.json`), JSON.stringify(product, null, 2) + "\n");
  }

  console.log(`Productos: ${products.size}`);
  console.log("Componentes usados (nº de piezas):", Object.fromEntries(usage));
  if (DOWNLOAD_IMAGES) await downloadImages();
  else console.log(`Imágenes referenciadas: ${images.size} (descarga omitida)`);

  if (errors.length) {
    console.error(`\n${errors.length} ficheros MDX no compilan:`);
    errors.forEach((e) => console.error("  " + e));
    process.exitCode = 1;
  } else {
    console.log("Todos los MDX compilan.");
  }
}

main();
