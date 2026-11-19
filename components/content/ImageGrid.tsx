import Link from "next/link";

type Tile = { href: string; image: string; alt: string };

/** Rejilla de imágenes enlazadas: 2 por fila en móvil, 4 en escritorio. */
export function ImageGrid({ items }: { items: Tile[] }) {
  return (
    <ul className="not-prose my-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="block overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.alt} width={600} height={400} loading="lazy" className="aspect-[3/2] w-full object-cover" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
