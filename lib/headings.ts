/** Utilidades compartidas por el índice de contenidos y los encabezados del MDX. */

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Texto plano de un encabezado markdown (sin enlaces, negritas ni etiquetas). */
export function headingText(md: string): string {
  return md
    .replace(/<[^>]+>/g, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\\(.)/g, "$1")
    .replace(/^[^\p{L}\p{N}¿¡]+/u, "")
    .trim();
}

export type TocItem = { id: string; text: string };

/** Apartados (##) del cuerpo MDX, sin repetidos. */
export function tocItems(body: string): TocItem[] {
  const seen = new Set<string>();
  const items: TocItem[] = [];
  for (const m of body.matchAll(/^## +(.+?)\s*#*\s*$/gm)) {
    const text = headingText(m[1]);
    const id = slugify(text);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    items.push({ id, text });
  }
  return items;
}
