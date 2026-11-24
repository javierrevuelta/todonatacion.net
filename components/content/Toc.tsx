import type { TocItem } from "@/lib/headings";

/** Mínimo de apartados para que merezca la pena mostrar el índice. */
export const TOC_MIN = 5;

/** Índice de contenidos plegable al principio de las páginas largas. */
export function Toc({ items }: { items: TocItem[] }) {
  if (items.length < TOC_MIN) return null;
  return (
    <details className="group mb-8 rounded-xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
        <span>
          En esta página <span className="font-normal text-slate-500">({items.length} apartados)</span>
        </span>
        <svg aria-hidden viewBox="0 0 20 20" className="size-5 fill-slate-400 transition group-open:rotate-180">
          <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
        </svg>
      </summary>
      <nav aria-label="Índice de contenidos" className="border-t border-slate-100 px-4 py-3">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm marker:text-slate-400">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-sky-700 hover:underline">
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}
