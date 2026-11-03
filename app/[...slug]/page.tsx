import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntryView, PostList, entryMetadata } from "@/components/content/EntryView";
import { getAllPaths, getCategory, getEntryByPath, getPosts } from "@/lib/content";

/**
 * Un único catch-all porque WordPress mezcla en el mismo nivel páginas
 * (/gafas/zoggs/), posts (/consejos/<slug>/) y categorías (/consejos/).
 * Cada fichero de content/ declara su URL exacta en el frontmatter (`path`).
 */
type Props = { params: Promise<{ slug: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPaths().map((p) => ({ slug: p.split("/").filter(Boolean) }));
}

function resolve(slug: string[]) {
  const urlPath = `/${slug.join("/")}/`;
  const entry = getEntryByPath(urlPath);
  if (entry) return { entry } as const;
  const category = slug.length === 1 ? getCategory(slug[0]) : undefined;
  if (category) return { category } as const;
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = resolve((await params).slug);
  if (!found) return {};
  if ("entry" in found && found.entry) return entryMetadata(found.entry);
  const { category } = found;
  return {
    title: category!.name,
    description: category!.description || `Artículos de ${category!.name.toLowerCase()} sobre natación.`,
    alternates: { canonical: `/${category!.slug}/` },
  };
}

export default async function Page({ params }: Props) {
  const found = resolve((await params).slug);
  if (!found) notFound();
  if ("entry" in found && found.entry) return <EntryView entry={found.entry} />;

  const category = found.category!;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-extrabold text-slate-900">{category.name}</h1>
      {category.description && <p className="mb-6 text-slate-600">{category.description}</p>}
      <PostList posts={getPosts({ category: category.slug })} />
    </div>
  );
}
