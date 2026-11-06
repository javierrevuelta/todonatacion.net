import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/material-de-natacion/", label: "Material de natación" },
  { href: "/estilos-natacion/", label: "Estilos de natación" },
  { href: "/planes-entrenamiento/", label: "Planes de entrenamiento" },
  { href: "/blog/", label: "Blog" },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-semibold text-sky-600">Error 404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Esta página no existe</h1>
      <p className="mt-4 text-slate-700">
        Puede que el enlace esté mal escrito o que el contenido se haya movido. Prueba con una de estas secciones:
      </p>
      <ul className="mt-6 flex flex-wrap gap-3">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-block rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-800 hover:border-sky-400 hover:text-sky-700">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
