/**
 * Limpieza de títulos y descripciones SEO heredados de WordPress: quita la
 * decoración de "SEO de 2018" (▷, ✅, 【】, el año, la marca repetida y las
 * palabras en mayúsculas) que hoy resta CTR y credibilidad.
 */

const PICTOGRAPHS = /\p{Extended_Pictographic}|[▷►ᐈ]|️/gu;
/** Siglas que se quedan en mayúsculas. */
const KEEP_UPPERCASE = new Set(["SWOLF", "GPS", "FINA", "TEA", "XT", "HR"]);

function stripDecoration(s: string): string {
  return (
    s
      .replace(/\u00a0/g, " ")
      // Emoji entre dos textos hacía de separador: "Salto ✨ Conoce" → "Salto: Conoce"
      .replace(/(\S)\s*(?:\p{Extended_Pictographic}|[▷►ᐈ]|\uFE0F)+\s*(?=\S)/gu, "$1: ")
      .replace(PICTOGRAPHS, " ")
      .replace(/^\s*>>\s*/, "")
      // "del 【2026 】", "de 2026", "【2021】", "2026" sueltos (no distancias como "2000 a 2500 m")
      .replace(/\s*(?:\b(?:de|del)\s*)?【?\s*\b20[12]\d\b\s*】?(?!\s*(?:a\s+\d|-\s*\d|m\b|m\.|metros))(?=\s|[:|,.-]|$)/gi, " ")
      // 【Conoce su origen】 → Conoce su origen
      .replace(/【\s*([^】]*?)\s*】/g, " $1 ")
      // "?" que en WordPress era un emoji perdido: "Tablas ? Un complemento"
      .replace(/(\S)\s+\?\s+(?=\S)/g, "$1: ")
      .replace(/\s+\?\s*$/, "")
      .replace(/\s+([:,.])/g, "$1")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

function trimSeparators(s: string): string {
  return s.replace(/^[\s|:–-]+/, "").replace(/[\s|:–-]+$/, "").trim();
}

function unshout(s: string): string {
  let first = true;
  return s.replace(/[\p{L}]+/gu, (word) => {
    const isFirst = first;
    first = false;
    if (word.length < 4 || KEEP_UPPERCASE.has(word) || word !== word.toUpperCase()) return word;
    const lower = word.toLowerCase();
    return isFirst ? lower[0].toUpperCase() + lower.slice(1) : lower;
  });
}

export function cleanSeoTitle(title: string): string {
  let s = stripDecoration(title);
  // Marca al principio o al final: la añade la plantilla del layout cuando cabe.
  s = s.replace(/^\s*Todo ?Nataci[oó]n(\.net)?\s*[-|:]\s*/i, "");
  s = s.replace(/\s*[-|]?\s*Todo ?Nataci[oó]n(\.net)?\s*$/i, "");
  return trimSeparators(unshout(trimSeparators(s)));
}

export function cleanSeoDescription(description: string): string {
  return stripDecoration(description).replace(/\s+([!?¡¿])\s+/g, " $1").trim();
}

/** Títulos cortos llevan " - Todo Natación" (plantilla del layout); los largos van tal cual. */
export const BRANDED_TITLE_MAX = 45;
