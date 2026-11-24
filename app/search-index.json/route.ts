import { getCategory, getEntries } from "@/lib/content";
import type { SearchDoc } from "@/lib/search";

/** Índice del buscador de la cabecera: se genera en el build y se descarga al abrirlo. */
export const dynamic = "force-static";

function plain(md: string) {
  return md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .trim();
}

export function GET() {
  const docs: SearchDoc[] = getEntries()
    .filter((e) => !e.noindex && e.path !== "/")
    .map((e) => ({
      t: e.title,
      p: e.path,
      d: e.description ? plain(e.description).replace(/\.\.\.$/, "…") : undefined,
      c: e.type === "post" ? getCategory(e.categories[0] ?? "")?.name : undefined,
      h: [...e.body.matchAll(/^#{2,3} +(.+)$/gm)].map((m) => plain(m[1])).join(" · "),
    }));
  return Response.json(docs);
}
