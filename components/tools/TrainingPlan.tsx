"use client";

import { usePathname } from "next/navigation";
import { useRef, useSyncExternalStore } from "react";

/**
 * Herramientas de los planes de entrenamiento: marcar sesiones hechas (se
 * guardan en este navegador) y desplegar/plegar todas.
 */
const EVENT = "plan-progress";
const EMPTY: number[] = [];
const key = (path: string) => `plan:${path}`;
const cache = new Map<string, { raw: string | null; value: number[] }>();

function read(path: string): number[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key(path));
  } catch {}
  const hit = cache.get(path);
  if (hit && hit.raw === raw) return hit.value;
  let value = EMPTY;
  try {
    value = raw ? (JSON.parse(raw) as number[]) : EMPTY;
  } catch {}
  cache.set(path, { raw, value });
  return value;
}

function write(path: string, done: number[]) {
  try {
    if (done.length) localStorage.setItem(key(path), JSON.stringify(done));
    else localStorage.removeItem(key(path));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function useDone(): [number[], string] {
  const path = usePathname();
  const done = useSyncExternalStore(subscribe, () => read(path), () => EMPTY);
  return [done, path];
}

function sessions(): HTMLDetailsElement[] {
  return [...document.querySelectorAll<HTMLDetailsElement>("details[data-session]")];
}

const button =
  "cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-sky-400 hover:text-sky-700";

export function PlanToolbar({ total }: { total: number }) {
  const [done, path] = useDone();
  const pct = Math.round((done.length / total) * 100);

  const setAll = (open: boolean) => sessions().forEach((d) => (d.open = open));

  return (
    <div className="not-prose my-6 rounded-xl border border-sky-200 bg-sky-50 p-4 print:hidden">
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-900">Tu progreso</span>
        <span className="text-slate-600" aria-live="polite">
          {done.length} de {total} sesiones hechas
        </span>
      </div>
      <div
        className="mb-4 h-2 overflow-hidden rounded-full bg-white"
        role="progressbar"
        aria-label="Sesiones hechas"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onClick={() => setAll(true)}>
          Desplegar todas
        </button>
        <button type="button" className={button} onClick={() => setAll(false)}>
          Plegar todas
        </button>
        {done.length > 0 && (
          <button
            type="button"
            className={`${button} text-slate-500`}
            onClick={() => confirm("¿Borrar las sesiones marcadas como hechas?") && write(path, [])}
          >
            Reiniciar progreso
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-500">El progreso se guarda solo en este navegador.</p>
    </div>
  );
}

/** Sesión del plan: se puede marcar como hecha; al hacerlo se pliega y se abre la siguiente. */
export function SessionDetails({ title, index, children }: { title: string; index: number; children?: React.ReactNode }) {
  const [done, path] = useDone();
  const ref = useRef<HTMLDetailsElement>(null);
  const isDone = done.includes(index);

  const toggle = () => {
    const next = isDone ? done.filter((i) => i !== index) : [...done, index].sort((a, b) => a - b);
    write(path, next);
    if (!isDone && ref.current) {
      ref.current.open = false;
      const all = sessions();
      const following = all[all.indexOf(ref.current) + 1];
      if (following) {
        following.open = true;
        following.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <details ref={ref} data-session={index} className={isDone ? "opacity-80" : undefined}>
      <summary>
        <span className="inline-flex w-[calc(100%-1.5rem)] items-center justify-between gap-2 align-middle">
          <span>{title}</span>
          {isDone && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">✓ Hecha</span>
          )}
        </span>
      </summary>
      {children}
      <div className="not-prose pb-4 print:hidden">
        <button
          type="button"
          onClick={toggle}
          className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold ${
            isDone
              ? "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {isDone ? "Desmarcar sesión" : "✓ Marcar como hecha"}
        </button>
      </div>
    </details>
  );
}
