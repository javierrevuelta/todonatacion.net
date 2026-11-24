import Link from "next/link";
import type { Crumb } from "@/lib/breadcrumbs";
import { SITE_URL } from "@/lib/site";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: new URL(c.href, SITE_URL).toString(),
    })),
  };
  return (
    <nav aria-label="Migas de pan" className="mb-4 text-sm text-slate-500">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.href} className={`flex min-w-0 items-center gap-1.5 ${last ? "max-w-full" : ""}`}>
              {last ? (
                <span aria-current="page" className="truncate text-slate-700">
                  {c.label}
                </span>
              ) : (
                <>
                  <Link href={c.href} className="hover:text-sky-700 hover:underline">
                    {c.label}
                  </Link>
                  <span aria-hidden className="text-slate-400">›</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
