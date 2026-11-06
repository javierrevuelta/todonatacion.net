import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { z } from "zod";

const CONTENT_DIR = path.join(process.cwd(), "content");

const FrontmatterSchema = z.object({
  title: z.string(),
  /** URL pública exacta, con barra final (igual que en WordPress). */
  path: z.string().regex(/^\/([a-z0-9-]+\/)*$/),
  type: z.enum(["page", "post"]),
  wpId: z.number().optional(),
  date: z.string(),
  modified: z.string().optional(),
  seoTitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  noindex: z.boolean().optional(),
  parent: z.number().optional(),
  order: z.number().optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  jsonLd: z.array(z.unknown()).optional(),
  /** Editada a mano: `npm run migrate` no la sobrescribe. */
  manual: z.boolean().optional(),
});

export type Entry = z.infer<typeof FrontmatterSchema> & { body: string; file: string };

export type Category = { slug: string; name: string; description: string; count: number };

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    return d.isDirectory() ? walk(full) : d.name.endsWith(".mdx") ? [full] : [];
  });
}

export const getEntries = cache((): Entry[] => {
  return [...walk(path.join(CONTENT_DIR, "pages")), ...walk(path.join(CONTENT_DIR, "posts"))].map((file) => {
    const { data, content } = matter(fs.readFileSync(file, "utf8"));
    const parsed = FrontmatterSchema.safeParse(data);
    if (!parsed.success) throw new Error(`Frontmatter inválido en ${file}: ${parsed.error.message}`);
    return { ...parsed.data, body: content, file };
  });
});

export const getCategories = cache((): Category[] =>
  JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "categories.json"), "utf8")),
);

export function getEntryByPath(urlPath: string): Entry | undefined {
  return getEntries().find((e) => e.path === urlPath);
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getPosts({ category }: { category?: string } = {}): Entry[] {
  return getEntries()
    .filter((e) => e.type === "post" && (!category || e.categories.includes(category)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Rutas que genera el catch-all: páginas, posts y categorías con contenido. */
export function getAllPaths(): string[] {
  const entries = getEntries().map((e) => e.path).filter((p) => p !== "/");
  const categories = getCategories().filter((c) => c.count > 0).map((c) => `/${c.slug}/`);
  return [...new Set([...entries, ...categories])];
}
