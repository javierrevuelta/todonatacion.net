/** Documento del índice de búsqueda (claves cortas para que pese poco). */
export type SearchDoc = { t: string; p: string; d?: string; c?: string; h: string };

export function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Todas las palabras deben aparecer; puntúa más si están en el título. */
export function searchDocs(docs: SearchDoc[], query: string, limit = 8): SearchDoc[] {
  const terms = normalize(query).split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return [];
  return docs
    .map((doc) => {
      const title = normalize(doc.t);
      const rest = normalize(`${doc.c ?? ""} ${doc.d ?? ""} ${doc.h}`);
      let score = 0;
      for (const term of terms) {
        if (title.includes(term)) score += title.split(/\W+/).includes(term) ? 4 : 3;
        else if (rest.includes(term)) score += 1;
        else return { doc, score: 0 };
      }
      return { doc, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.doc);
}
