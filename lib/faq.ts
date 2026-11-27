import { headingText } from "./headings";

export type FaqItem = { question: string; answer: string };

/** Texto plano de un bloque markdown (enlaces, negritas y viñetas fuera). */
function plain(md: string): string {
  return md
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-*]|\d+\.)\s+/, ""))
    .join(" ")
    .replace(/<[^>]+>/g, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\\(.)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Un bloque es texto de respuesta si no es un componente, una imagen ni una tabla. */
const isText = (block: string) => !/^\s*(<|!\[|\[!\[|\|)/.test(block);

/**
 * Preguntas de la sección «## Preguntas frecuentes…» del MDX: cada «### ¿…?» es una
 * pregunta y su primer párrafo (más la lista que lo siga si acaba en «:») es la respuesta.
 * Lo que venga detrás (vídeos, «otros materiales»…) no forma parte de la respuesta.
 */
export function faqItems(body: string): FaqItem[] {
  const start = body.search(/^## +Preguntas frecuentes/m);
  if (start < 0) return [];
  const rest = body.slice(start).replace(/^.*\n/, "");
  const end = rest.search(/^#{1,2} |^#### /m);
  const section = end < 0 ? rest : rest.slice(0, end);

  const items: FaqItem[] = [];
  for (const part of section.split(/^### +/m).slice(1)) {
    const [head, ...lines] = part.split("\n");
    const question = headingText(head);
    const blocks = lines.join("\n").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    if (!question || !blocks.length || !isText(blocks[0])) continue;
    let answer = blocks[0];
    if (answer.endsWith(":") && blocks[1] && /^\s*(?:[-*]|\d+\.)\s/.test(blocks[1])) answer += "\n" + blocks[1];
    const text = plain(answer);
    if (text) items.push({ question, answer: text });
  }
  return items;
}

/** JSON-LD FAQPage, o null si la página no tiene preguntas frecuentes. */
export function faqJsonLd(body: string) {
  const items = faqItems(body);
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}
