import "server-only";
import { getCategory, getEntryByPath, type Entry } from "./content";
import { NAV } from "./site";

export type Crumb = { href: string; label: string };

/**
 * Páginas índice que agrupan guías que en WordPress colgaban de la raíz
 * (/gafas/, /neopreno/…): se usan como «padre» en las migas de pan.
 */
const HUBS = ["/material-de-natacion/"];

/** Etiqueta corta: la del menú si la sección está en él; si no, el título. */
function label(path: string, title: string) {
  for (const item of NAV) {
    if (item.href === path) return item.label;
    const child = item.children?.find((c) => c.href === path);
    if (child) return child.label;
  }
  return title;
}

function parentOf(entry: Entry): Entry | undefined {
  const segments = entry.path.split("/").filter(Boolean);
  for (let i = segments.length - 1; i > 0; i--) {
    const parent = getEntryByPath(`/${segments.slice(0, i).join("/")}/`);
    if (parent) return parent;
  }
  return HUBS.map((h) => getEntryByPath(h)).find(
    (hub) => hub && hub.path !== entry.path && hub.body.includes(`"${entry.path}"`),
  );
}

/** Inicio › … › página actual. Vacío en la portada. */
export function entryCrumbs(entry: Entry): Crumb[] {
  if (entry.path === "/") return [];
  const trail: Crumb[] = [{ href: entry.path, label: label(entry.path, entry.title) }];
  if (entry.type === "post") {
    const category = getCategory(entry.categories[0] ?? "");
    if (category) trail.unshift({ href: `/${category.slug}/`, label: category.name });
  } else {
    const seen = new Set([entry.path]);
    for (let p = parentOf(entry); p && !seen.has(p.path); p = parentOf(p)) {
      seen.add(p.path);
      trail.unshift({ href: p.path, label: label(p.path, p.title) });
    }
  }
  return [{ href: "/", label: "Inicio" }, ...trail];
}
