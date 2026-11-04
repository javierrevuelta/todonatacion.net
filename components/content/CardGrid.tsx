import Link from "next/link";

type Card = { href: string; title: string; description?: string; image: string; alt?: string };

/** Rejilla de tarjetas enlazadas (sustituye a las galerías con enlaces de WordPress). */
export function CardGrid({ items }: { items: Card[] }) {
  return (
    <ul className="not-prose my-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.alt ?? ""} loading="lazy" className="aspect-[3/2] w-full object-cover" />
            <span className="flex flex-col gap-1 p-3">
              <span className="font-semibold text-slate-900">{item.title}</span>
              {item.description && <span className="text-sm text-slate-600">{item.description}</span>}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
