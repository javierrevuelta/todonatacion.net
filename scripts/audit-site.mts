/**
 * Audita el HTML generado por `next build` (sin servidor):
 *   - enlaces internos que no llevan a ninguna página
 *   - URLs mal formadas heredadas de WordPress (https:/x, ///wp-content)
 *   - imágenes locales (contenido y og:image) que no existen en public/
 *   - páginas sin H1 o con más de uno
 *   - shortcodes de WordPress sin procesar ([mailpoet_form id="1"]…), en el texto o en la meta description
 *   - enlaces de Amazon sin amazon.es, sin el tag o sin rel="sponsored"
 *   - FAQPage cuyas preguntas o respuestas no se ven igual en la página
 *
 * Uso: npm run build && npm run audit
 * Sale con código 1 si hay errores.
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, ".next", "server", "app");
const PUBLIC_DIR = path.join(ROOT, "public");
const AMAZON_TAG = process.env.AMAZON_ASSOCIATE_TAG ?? "todonatacion-21";

if (!fs.existsSync(APP_DIR)) {
  console.error("No hay build: ejecuta `npm run build` antes.");
  process.exit(1);
}

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    return d.isDirectory() ? walk(full) : d.name.endsWith(".html") ? [full] : [];
  });
}

/** .next/server/app/gafas/zoggs.html → /gafas/zoggs/ */
function routeOf(file: string): string {
  const rel = path.relative(APP_DIR, file).replace(/\.html$/, "");
  return rel === "index" ? "/" : `/${rel}/`;
}

const files = walk(APP_DIR).filter((f) => !/_not-found|_global-error/.test(f));
const routes = new Set(files.map(routeOf));
const legacy = new Set(
  (JSON.parse(fs.readFileSync(path.join(ROOT, "redirects.json"), "utf8")) as { source: string }[]).map((r) => r.source),
);
const STATIC_ROUTES = new Set(["/sitemap.xml", "/robots.txt", "/favicon.ico"]);

type Issue = { level: "error" | "warn"; page: string; message: string };
const issues: Issue[] = [];
const report = (level: Issue["level"], page: string, message: string): void => {
  issues.push({ level, page, message });
};
let amazonLinks = 0;

const MALFORMED = /^(https?:)?\/\/\/|^https?:\/[^/]/;
/** [nombre atributo=…] o [nombre_con_guion_bajo]: así son los shortcodes, no el texto normal entre corchetes. */
const SHORTCODE = /\[\/?[a-z][\w-]*(?:\s+[\w-]+=[^\]]*|_[\w-]*)\]/i;

for (const file of files) {
  const page = routeOf(file);
  const $ = cheerio.load(fs.readFileSync(file, "utf8"));
  // Solo el contenido renderizado: los <link> del <head> y los scripts de Next no cuentan.
  const body = $("body");

  const text = body.clone().find("script, style, noscript").remove().end().text();
  for (const where of [text, $('meta[name="description"]').attr("content") ?? ""]) {
    const sc = where.match(SHORTCODE);
    if (sc) report("error", page, `shortcode de WordPress sin procesar: ${sc[0]}`);
  }

  // FAQPage: Google exige que preguntas y respuestas se vean tal cual en la página.
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  const visible = norm(text);
  const h3s = new Set(body.find("h3").map((_, el) => norm($(el).text())).get());
  const faqs: { mainEntity: { name: string; acceptedAnswer: { text: string } }[] }[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() ?? "");
      if (data["@type"] === "FAQPage") faqs.push(data);
    } catch {
      report("error", page, "JSON-LD que no es JSON válido");
    }
  });
  if (faqs.length > 1) report("error", page, `${faqs.length} bloques FAQPage (debe haber uno)`);
  for (const q of faqs.flatMap((f) => f.mainEntity)) {
    if (!h3s.has(norm(q.name))) report("error", page, `pregunta del FAQPage sin su H3 en la página: ${q.name}`);
    const answer = norm(q.acceptedAnswer?.text ?? "");
    if (!answer) report("error", page, `pregunta del FAQPage sin respuesta: ${q.name}`);
    else if (!visible.includes(answer)) report("error", page, `respuesta del FAQPage que no aparece en la página: ${q.name}`);
  }
  const faqHeading = body.find("h2").filter((_, el) => /^Preguntas frecuentes/i.test(norm($(el).text()))).length;
  if (faqHeading && !faqs.length) report("warn", page, "sección de preguntas frecuentes sin FAQPage");

  const h1 = body.find("h1").length;
  if (h1 !== 1) report("error", page, `${h1} encabezados H1 (debe haber exactamente 1)`);

  body.find("img[src]").each((_, el) => {
    const src = $(el).attr("src")!;
    if (MALFORMED.test(src)) return report("error", page, `imagen mal formada: ${src}`);
    // En Mac el disco ignora la forma Unicode; en Vercel una "ñ" en NFD da 403.
    if (decodeURIComponent(src) !== decodeURIComponent(src).normalize("NFC"))
      return report("error", page, `imagen con Unicode NFD (en Vercel da 403): ${src}`);
    if (src.startsWith("/") && !src.startsWith("//") && !src.startsWith("/_next/")) {
      const local = path.join(PUBLIC_DIR, decodeURIComponent(src.split("?")[0]));
      if (!fs.existsSync(local)) report("error", page, `imagen no encontrada: ${src}`);
    }
  });

  // Imagen para redes (og:image): debe servirse desde public/, no desde el WordPress antiguo.
  $('meta[property="og:image"]').each((_, el) => {
    const url = $(el).attr("content")!;
    const own = url.match(/^https?:\/\/(?:www\.)?todonatacion\.net(\/.*)$/);
    if (!own) return report("warn", page, `og:image externa: ${url}`);
    const local = path.join(PUBLIC_DIR, decodeURIComponent(own[1].split("?")[0]));
    if (!fs.existsSync(local)) report("error", page, `og:image no encontrada en public/: ${url}`);
  });

  body.find("a[href]").each((_, el) => {
    const $a = $(el);
    const href = $a.attr("href")!;
    if (MALFORMED.test(href)) return report("error", page, `enlace mal formado: ${href}`);
    if (decodeURIComponent(href) !== decodeURIComponent(href).normalize("NFC"))
      return report("error", page, `enlace con Unicode NFD (en Vercel da 403): ${href}`);

    if (href.startsWith("/") && !href.startsWith("//")) {
      const clean = href.split(/[?#]/)[0];
      if (clean.startsWith("/go/")) return;
      if (clean.startsWith("/wp-content/")) {
        if (!fs.existsSync(path.join(PUBLIC_DIR, decodeURIComponent(clean)))) {
          report("error", page, `fichero no encontrado: ${href}`);
        }
        return;
      }
      if (STATIC_ROUTES.has(clean) || routes.has(clean)) return;
      if (legacy.has(clean)) return report("warn", page, `enlace a URL antigua (redirige): ${href}`);
      return report("error", page, `enlace interno roto: ${href}`);
    }

    let url: URL;
    try {
      url = new URL(href);
    } catch {
      return; // mailto:, tel:, anclas…
    }
    if (url.hostname === "todonatacion.net" || url.hostname === "www.todonatacion.net") {
      return report("warn", page, `enlace interno absoluto (mejor relativo): ${href}`);
    }
    if (url.hostname === "amzn.to") return report("error", page, `enlace corto de Amazon (tag sin verificar): ${href}`);
    if (/(^|\.)amazon\./.test(url.hostname)) {
      amazonLinks++;
      if (url.hostname !== "www.amazon.es") report("error", page, `Amazon de otro país: ${href}`);
      if (url.searchParams.get("tag") !== AMAZON_TAG) report("error", page, `Amazon sin tag ${AMAZON_TAG}: ${href}`);
      if (!($a.attr("rel") ?? "").split(/\s+/).includes("sponsored")) {
        report("error", page, `Amazon sin rel="sponsored": ${href}`);
      }
    }
  });
}

// Sitemap: Search Console rechaza fechas que no sean W3C Datetime
// (solo día, o día y hora CON zona horaria).
const sitemapFile = path.join(APP_DIR, "sitemap.xml.body");
if (fs.existsSync(sitemapFile)) {
  const W3C_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?$/;
  for (const [, d] of fs.readFileSync(sitemapFile, "utf8").matchAll(/<lastmod>([^<]*)<\/lastmod>/g)) {
    if (!W3C_DATE.test(d)) report("error", "/sitemap.xml", `lastmod no válido para Search Console: ${d}`);
  }
} else {
  report("warn", "/sitemap.xml", "no se encontró el sitemap generado");
}

const errors = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");
for (const i of [...errors, ...warns]) console.log(`${i.level === "error" ? "✗" : "!"} ${i.page}  ${i.message}`);
console.log(
  `\n${files.length} páginas · ${amazonLinks} enlaces a Amazon · ${errors.length} errores · ${warns.length} avisos`,
);
if (errors.length) process.exitCode = 1;
