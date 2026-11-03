import type { MetadataRoute } from "next";
import { getAllPaths, getEntryByPath } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", ...getAllPaths()]
    .map((p) => ({ path: p, entry: getEntryByPath(p) }))
    .filter(({ entry }) => !entry?.noindex)
    .map(({ path, entry }) => ({
      url: new URL(path, SITE_URL).toString(),
      lastModified: entry?.modified ?? entry?.date,
    }));
}
