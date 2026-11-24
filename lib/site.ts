export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://todonatacion.net";
export const SITE_NAME = "Todo Natación";
export const SITE_TAGLINE = "Disfruta de tu pasión por el agua";

export type NavItem = { href: string; label: string; icon?: string; children?: { href: string; label: string }[] };

/** Menú principal, igual que en WordPress. El emoji va aparte para ocultarlo a lectores de pantalla. */
export const NAV: NavItem[] = [
  { href: "/", label: "Inicio", icon: "🏡" },
  { href: "/material-de-natacion/", label: "Material", icon: "🤿" },
  {
    href: "/estilos-natacion/",
    label: "Estilos",
    icon: "🏊🏼",
    children: [
      { href: "/estilos-natacion/crol-estilo-libre-natacion/", label: "Crol" },
      { href: "/estilos-natacion/braza/", label: "Braza" },
      { href: "/estilos-natacion/mariposa/", label: "Mariposa" },
      { href: "/estilos-natacion/espalda/", label: "Espalda" },
    ],
  },
  { href: "/noticias/", label: "Noticias", icon: "🗞️" },
  { href: "/consejos/", label: "Consejos", icon: "💡" },
  { href: "/planes-entrenamiento/", label: "Entrenamiento", icon: "📗" },
];

/**
 * Guías de compra enlazadas desde el pie en todas las páginas (en WordPress era
 * el widget "Análisis de los Últimos Productos", con los enlaces rotos).
 */
export const FOOTER_GUIDES = [
  { href: "/gafas/", label: "Gafas de natación" },
  { href: "/neopreno/", label: "Neoprenos para nadar" },
  { href: "/palas/", label: "Palas de natación" },
  { href: "/aletas/", label: "Aletas para nadar" },
  { href: "/banador-hombre/", label: "Bañadores de hombre" },
  { href: "/banador-mujer/", label: "Bañadores de mujer" },
  { href: "/material-de-natacion/", label: "Todo el material" },
];

export const FOOTER_NAV = [
  { href: "/sobre-mi/", label: "Sobre mí" },
  { href: "/contacto/", label: "Contacto" },
  { href: "/aviso-legal/", label: "Aviso legal" },
  { href: "/politica-de-privacidad/", label: "Política de privacidad" },
  { href: "/politica-de-cookies/", label: "Política de cookies" },
];
