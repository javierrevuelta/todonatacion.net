/**
 * Audita el HTML generado por `next build` (sin servidor):
 *   - enlaces internos que no llevan a ninguna página
 *   - URLs mal formadas heredadas de WordPress (https:/x, ///wp-content)
 *   - imágenes locales que no existen en public/
 *   - enlaces de Amazon sin amazon.es, sin el tag o sin rel="sponsored"
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

for (const file of files) {
  const page = routeOf(file);
  const $ = cheerio.load(fs.readFileSync(file, "utf8"));
  // Solo el contenido renderizado: los <link> del <head> y los scripts de Next no cuentan.
  const body = $("body");

  body.find("img[src]").each((_, el) => {
    const src = $(el).attr("src")!;
    if (MALFORMED.test(src)) return report("error", page, `imagen mal formada: ${src}`);
    if (src.startsWith("/") && !src.startsWith("//") && !src.startsWith("/_next/")) {
      const local = path.join(PUBLIC_DIR, decodeURIComponent(src.split("?")[0]));
      if (!fs.existsSync(local)) report("error", page, `imagen no encontrada: ${src}`);
    }
  });

  body.find("a[href]").each((_, el) => {
    const $a = $(el);
    const href = $a.attr("href")!;
    if (MALFORMED.test(href)) return report("error", page, `enlace mal formado: ${href}`);

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

const errors = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");
for (const i of [...errors, ...warns]) console.log(`${i.level === "error" ? "✗" : "!"} ${i.page}  ${i.message}`);
console.log(
  `\n${files.length} páginas · ${amazonLinks} enlaces a Amazon · ${errors.length} errores · ${warns.length} avisos`,
);
if (errors.length) process.exitCode = 1;
