"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { searchDocs, type SearchDoc } from "@/lib/search";

/** Las búsquedas más útiles para quien llega sin saber qué buscar. */
const SUGGESTIONS = ["gafas", "neopreno", "crol", "plan de entrenamiento", "aletas", "calorías"];

let indexPromise: Promise<SearchDoc[]> | null = null;
function loadIndex() {
  indexPromise ??= fetch("/search-index.json")
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => {
      indexPromise = null;
      return [];
    });
  return indexPromise;
}

/** Botón de la cabecera que abre un buscador en un <dialog> (Escape lo cierra). */
export function Search() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const listId = useId();
  const results = searchDocs(docs, query);

  const open = () => {
    loadIndex().then(setDocs);
    dialog.current?.showModal();
    input.current?.select();
  };

  // Al navegar desde un resultado, se cierra.
  useEffect(() => dialog.current?.close(), [pathname]);

  // Atajo «/» como en muchos buscadores (salvo si se está escribiendo en un campo).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        open();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i + (e.key === "ArrowDown" ? 1 : results.length - 1)) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      router.push(results[Math.min(active, results.length - 1)].p);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        onMouseEnter={() => loadIndex()}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:border-sky-400 hover:text-sky-700"
      >
        <svg aria-hidden viewBox="0 0 20 20" className="size-4 fill-current">
          <path d="M8.5 3a5.5 5.5 0 0 1 4.38 8.83l3.65 3.64a.75.75 0 1 1-1.06 1.06l-3.64-3.65A5.5 5.5 0 1 1 8.5 3Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
        </svg>
        <span className="sr-only sm:not-sr-only">Buscar</span>
      </button>

      <dialog
        ref={dialog}
        aria-label="Buscar en Todo Natación"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-xl rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-900/40"
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-4">
          <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0 fill-slate-400">
            <path d="M8.5 3a5.5 5.5 0 0 1 4.38 8.83l3.65 3.64a.75.75 0 1 1-1.06 1.06l-3.64-3.65A5.5 5.5 0 1 1 8.5 3Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
          </svg>
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Busca técnica, material, planes…"
            aria-label="Buscar"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
            autoComplete="off"
            className="w-full py-4 text-base text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="cursor-pointer rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim().length < 2 ? (
            <div className="p-3 text-sm text-slate-600">
              <p className="mb-2">Prueba con:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setQuery(s);
                      input.current?.focus();
                    }}
                    className="cursor-pointer rounded-full border border-slate-200 px-3 py-1 hover:border-sky-400 hover:text-sky-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-slate-600">
              {docs.length ? `No hay resultados para «${query.trim()}».` : "Cargando…"}
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Resultados">
              {results.map((doc, i) => (
                <li key={doc.p} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={doc.p}
                    onMouseEnter={() => setActive(i)}
                    className={`block rounded-lg px-3 py-2 ${i === active ? "bg-sky-50" : ""}`}
                  >
                    {doc.c && <span className="block text-xs uppercase tracking-wide text-sky-700">{doc.c}</span>}
                    <span className="block font-semibold text-slate-900">{doc.t}</span>
                    {doc.d && <span className="line-clamp-1 text-sm text-slate-600">{doc.d}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}
