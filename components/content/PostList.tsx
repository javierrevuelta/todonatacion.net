import Link from "next/link";
import { getCategory, getPosts, type Entry } from "@/lib/content";

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

/** Últimos artículos (p. ej. en «Sobre mí», como artículos firmados por el autor). */
export function LatestPosts({ count = 6 }: { count?: number }) {
  return <PostList posts={getPosts().slice(0, count)} />;
}
