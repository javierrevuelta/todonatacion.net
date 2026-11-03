export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://todonatacion.net";
export const SITE_NAME = "Todo Natación";
export const SITE_TAGLINE = "Disfruta de tu pasión por el agua";

/** Menú principal, igual que en WordPress. */
export const NAV: { href: string; label: string; children?: { href: string; label: string }[] }[] = [
  { href: "/", label: "🏡 Inicio" },
  { href: "/material-de-natacion/", label: "🤿 Material" },
  {
    href: "/estilos-natacion/",
    label: "🏊🏼 Estilos",
    children: [
      { href: "/estilos-natacion/crol-estilo-libre-natacion/", label: "Crol" },
      { href: "/estilos-natacion/braza/", label: "Braza" },
      { href: "/estilos-natacion/mariposa/", label: "Mariposa" },
      { href: "/estilos-natacion/espalda/", label: "Espalda" },
    ],
  },
  { href: "/noticias/", label: "🗞️ Noticias" },
  { href: "/consejos/", label: "💡 Consejos" },
  { href: "/planes-entrenamiento/", label: "📗 Entrenamiento" },
];

export const FOOTER_NAV = [
  { href: "/sobre-mi/", label: "Sobre mí" },
  { href: "/contacto/", label: "Contacto" },
  { href: "/aviso-legal/", label: "Aviso legal" },
  { href: "/politica-de-cookies/", label: "Política de cookies" },
];
