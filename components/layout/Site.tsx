import Link from "next/link";
import { CookieSettingsButton } from "@/components/analytics/CookieSettingsButton";
import { FOOTER_GUIDES, FOOTER_NAV, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { DesktopNav, MobileNav } from "./Nav";
import { Search } from "./Search";

export function SiteHeader() {
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-30 rounded-lg bg-sky-700 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 md:gap-4">
          <Link href="/" className="mr-auto text-lg font-extrabold tracking-tight text-sky-700">
            {SITE_NAME}
          </Link>
          <DesktopNav />
          <Search />
          <MobileNav />
        </div>
      </header>
    </>
  );
}

function FooterColumn({
  title,
  links,
  children,
}: {
  title: string;
  links: { href: string; label: string }[];
  children?: React.ReactNode;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-sky-700">
              {l.label}
            </Link>
          </li>
        ))}
        {children}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white text-sm text-slate-600">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <p className="mb-3 font-semibold text-slate-900">{SITE_NAME}</p>
          <p className="mb-3">{SITE_TAGLINE}.</p>
          <p className="text-xs text-slate-500">
            Algunos enlaces de esta web son de afiliado: si compras a través de ellos recibimos una pequeña comisión,
            sin coste extra para ti. Como afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen
            los requisitos aplicables.
          </p>
        </div>
        <FooterColumn title="Guías de compra" links={FOOTER_GUIDES} />
        <FooterColumn title="Información legal" links={FOOTER_NAV}>
          <li>
            <CookieSettingsButton className="cursor-pointer hover:text-sky-700" />
          </li>
        </FooterColumn>
      </div>
    </footer>
  );
}
