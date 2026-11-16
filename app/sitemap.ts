import type { MetadataRoute } from "next";
import { getAllPaths, getEntryByPath } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", ...getAllPaths()]
    .map((p) => ({ path: p, entry: getEntryByPath(p) }))
    .filter(({ entry }) => !entry?.noindex)
    .map(({ path, entry }) => ({
      url: new URL(path, SITE_URL).toString(),
      // WordPress guarda la hora local sin zona horaria ("2026-07-23T13:39:23"), que
      // no es una fecha W3C válida para Search Console: se publica solo el día.
      lastModified: (entry?.modified ?? entry?.date)?.slice(0, 10),
    }));
}
