import Link from "next/link";
import { FOOTER_NAV, NAV, SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-sky-700">
          {SITE_NAME}
        </Link>
        {/* Menú sin JS: <details> en móvil, fila en escritorio */}
        <details className="group relative md:hidden">
          <summary className="cursor-pointer list-none rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium">
            Menú
          </summary>
          <nav className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            {NAV.map((item) => (
              <div key={item.href}>
                <Link href={item.href} className="block rounded-lg px-3 py-2 hover:bg-sky-50">
                  {item.label}
                </Link>
                {item.children?.map((c) => (
                  <Link key={c.href} href={c.href} className="block rounded-lg py-1.5 pl-8 text-sm text-slate-600 hover:bg-sky-50">
                    {c.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </details>
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {NAV.map((item) => (
            <div key={item.href} className="group relative">
              <Link href={item.href} className="block rounded-lg px-3 py-2 hover:bg-sky-50 hover:text-sky-700">
                {item.label}
              </Link>
              {item.children && (
                <div className="invisible absolute left-0 top-full w-48 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {item.children.map((c) => (
                    <Link key={c.href} href={c.href} className="block rounded-lg px-3 py-1.5 hover:bg-sky-50">
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>
          <strong className="text-slate-800">{SITE_NAME}</strong> · {SITE_TAGLINE}
        </p>
        <nav className="flex flex-wrap gap-4">
          {FOOTER_NAV.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-sky-700">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-slate-500">
        Como afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.
      </p>
    </footer>
  );
}
