import Link from "next/link";
import type { Metadata } from "next";
import { getCategory, getPosts, type Entry } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Mdx } from "./Mdx";

export function entryMetadata(entry: Entry): Metadata {
  return {
    title: entry.seoTitle ? { absolute: entry.seoTitle } : entry.title,
    description: entry.description,
    alternates: { canonical: entry.path },
    robots: entry.noindex ? { index: false } : undefined,
    openGraph: {
      title: entry.seoTitle ?? entry.title,
      description: entry.description,
      url: entry.path,
      type: entry.type === "post" ? "article" : "website",
      images: entry.image ? [entry.image] : undefined,
    },
  };
}

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const dateFmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });

export function PostList({ posts }: { posts: Entry[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {posts.map((p) => (
        <li key={p.path}>
          <Link
            href={p.path}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {p.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt="" loading="lazy" className="aspect-video w-full object-cover" />
            )}
            <div className="flex flex-col gap-2 p-4">
              <span className="text-xs uppercase tracking-wide text-sky-700">
                {getCategory(p.categories[0] ?? "")?.name}
              </span>
              <span className="font-semibold text-slate-900">{p.title}</span>
              {p.description && <span className="line-clamp-2 text-sm text-slate-600">{p.description}</span>}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export async function EntryView({ entry }: { entry: Entry }) {
  const category = entry.type === "post" ? getCategory(entry.categories[0] ?? "") : undefined;
  const article =
    entry.type === "post"
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: entry.title,
          description: entry.description,
          datePublished: entry.date,
          dateModified: entry.modified ?? entry.date,
          image: entry.image ? new URL(entry.image, SITE_URL).toString() : undefined,
          mainEntityOfPage: new URL(entry.path, SITE_URL).toString(),
          publisher: { "@type": "Organization", name: SITE_NAME },
        }
      : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      {article && <JsonLd data={article} />}
      {entry.jsonLd?.map((d, i) => <JsonLd key={i} data={d} />)}
      <header className="mb-6">
        {category && (
          <Link href={`/${category.slug}/`} className="text-sm font-semibold uppercase tracking-wide text-sky-700">
            {category.name}
          </Link>
        )}
        <h1 className="mt-1 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">{entry.title}</h1>
        {entry.type === "post" && (
          <p className="mt-2 text-sm text-slate-500">
            Actualizado el {dateFmt.format(new Date(entry.modified ?? entry.date))}
          </p>
        )}
      </header>
      <div className="prose prose-slate max-w-none prose-headings:scroll-mt-20 prose-a:text-sky-700 prose-img:rounded-lg">
        <Mdx source={entry.body} />
      </div>
      {entry.path === "/blog/" && (
        <div className="mt-10">
          <PostList posts={getPosts()} />
        </div>
      )}
    </article>
  );
}
