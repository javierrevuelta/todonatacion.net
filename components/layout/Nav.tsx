"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { NAV, type NavItem } from "@/lib/site";

/** La sección está activa si es la página actual o una de sus hijas (salvo Inicio). */
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Label({ item }: { item: NavItem }) {
  return (
    <>
      {item.icon && (
        <span aria-hidden className="mr-1">
          {item.icon}
        </span>
      )}
      {item.label}
    </>
  );
}

const activeClass = "bg-sky-50 text-sky-700";

/** Menú móvil: <details> que se cierra al navegar, al pulsar Escape o al tocar fuera. */
export function MobileNav() {
  const pathname = usePathname();
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  useEffect(() => {
    const close = (e: Event) => {
      const el = ref.current;
      if (!el?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !el.contains(e.target as Node)) {
        el.open = false;
        if (e instanceof KeyboardEvent) el.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("keydown", close);
    document.addEventListener("click", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("click", close);
    };
  }, []);

  return (
    <details ref={ref} className="group relative lg:hidden">
      <summary className="cursor-pointer list-none rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
        Menú
      </summary>
      <nav aria-label="Menú principal" className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
        {NAV.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`block rounded-lg px-3 py-2 hover:bg-sky-50 ${isActive(pathname, item.href) ? activeClass : ""}`}
            >
              <Label item={item} />
            </Link>
            {item.children?.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                aria-current={pathname === c.href ? "page" : undefined}
                className={`block rounded-lg py-1.5 pl-8 text-sm text-slate-600 hover:bg-sky-50 ${pathname.startsWith(c.href) ? activeClass : ""}`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </details>
  );
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Menú principal" className="hidden items-center gap-1 text-sm font-medium lg:flex">
      {NAV.map((item) => (
        <div key={item.href} className="group relative">
          <Link
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={`block rounded-lg px-3 py-2 hover:bg-sky-50 hover:text-sky-700 ${isActive(pathname, item.href) ? activeClass : ""}`}
          >
            <Label item={item} />
          </Link>
          {item.children && (
            <div className="invisible absolute left-0 top-full w-48 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              {item.children.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  aria-current={pathname === c.href ? "page" : undefined}
                  className={`block rounded-lg px-3 py-1.5 hover:bg-sky-50 ${pathname.startsWith(c.href) ? activeClass : ""}`}
                >
                  {c.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
