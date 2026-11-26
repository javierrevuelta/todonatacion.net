import { SITE_NAME, SITE_URL } from "./site";

/**
 * Autor de la web: fuente única para la firma, el bloque de autor, la página
 * «Sobre mí» y los datos estructurados (Person). Solo el nombre de pila: no se
 * vincula con la marca personal del autor.
 */
export const AUTHOR = {
  name: "Javier",
  role: "Nadador de aguas abiertas",
  url: "/sobre-mi/",
  /** Foto actual (retrato). Sustituir aquí cuando haya una foto en el agua. */
  image: "/wp-content/uploads/2020/06/Captura-de-pantalla-2018-12-24-a-las-0.26.51.png",
  imageAlt: `Javier, fundador de ${SITE_NAME}`,
  shortBio:
    "Empecé a nadar de adulto en 2013 y acabé completando travesías de hasta 15 km. En Todo Natación comparto lo que he aprendido por el camino para ayudarte a nadar mejor, sin importar tu nivel.",
  description: "Nadador de aguas abiertas. Empezó a nadar de adulto en 2013 y completó travesías de hasta 15 km.",
  knowsAbout: ["Natación", "Aguas abiertas", "Técnica de natación", "Entrenamiento de natación"],
} as const;

const abs = (path: string) => new URL(path, SITE_URL).toString();

/** Schema.org Person del autor (completo en «Sobre mí», referenciado en los artículos). */
export function authorPerson() {
  return {
    "@type": "Person",
    "@id": `${abs(AUTHOR.url)}#javier`,
    name: AUTHOR.name,
    description: AUTHOR.description,
    url: abs(AUTHOR.url),
    image: abs(AUTHOR.image),
    jobTitle: AUTHOR.role,
    knowsAbout: AUTHOR.knowsAbout,
  };
}

export function publisherOrganization() {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: abs("/apple-icon.png") },
  };
}

/**
 * Páginas sin firma de autor: portada, índices, utilidades y la propia «Sobre mí».
 * Las legales y descargas ya quedan fuera por ser noindex.
 */
const UNSIGNED = new Set([
  "/",
  "/sobre-mi/",
  "/contacto/",
  "/blog/",
  "/recursos/",
  "/material-de-natacion/",
  "/planes-entrenamiento/",
  "/estilos-natacion/",
  "/programa-tecnica/",
]);

export function isSigned(entry: { path: string; noindex?: boolean }): boolean {
  return !entry.noindex && !UNSIGNED.has(entry.path);
}
