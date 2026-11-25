import "server-only";
import type { NewsletterVariant } from "./forms";

/**
 * Cliente mínimo de la API pública de Systeme (https://developer.systeme.io/).
 * Variables de entorno (en Vercel → Settings → Environment Variables):
 *   SYSTEME_API_KEY                 clave de la API pública (Systeme → Ajustes → Clave API pública)
 *   SYSTEME_TAG_NEWSLETTER          id numérico de la etiqueta de la newsletter
 *   SYSTEME_TAG_GUIA_7_ERRORES      id de la etiqueta del lead magnet
 *   SYSTEME_TAG_PROGRAMA_TECNICA    id de la etiqueta de la lista de espera
 * Las dos últimas son opcionales: si faltan (el plan gratuito de Systeme solo
 * permite una etiqueta), esos formularios usan la etiqueta de la newsletter.
 * Las automatizaciones de Systeme («etiqueta añadida» → enviar email, confirmar,
 * entregar la guía…) se disparan con esas etiquetas.
 */
const API = "https://api.systeme.io/api";

const TAG_ENV: Record<NewsletterVariant, string> = {
  newsletter: "SYSTEME_TAG_NEWSLETTER",
  "guia-7-errores": "SYSTEME_TAG_GUIA_7_ERRORES",
  "programa-tecnica": "SYSTEME_TAG_PROGRAMA_TECNICA",
};

export function systemeConfigured(): boolean {
  return Boolean(process.env.SYSTEME_API_KEY);
}

async function call(path: string, init: RequestInit & { json?: unknown } = {}): Promise<Response> {
  const { json, headers, ...rest } = init;
  return fetch(`${API}${path}`, {
    ...rest,
    headers: {
      "X-API-Key": process.env.SYSTEME_API_KEY ?? "",
      Accept: "application/json",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });
}

async function findContactId(email: string): Promise<number | null> {
  const res = await call(`/contacts?email=${encodeURIComponent(email)}&limit=10`);
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: { id: number; email: string }[] };
  return data.items?.find((c) => c.email.toLowerCase() === email.toLowerCase())?.id ?? null;
}

/** Crea el contacto (o reutiliza el existente) y le pone la etiqueta del formulario. */
export async function subscribe(input: {
  variant: NewsletterVariant;
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  const fields = [
    input.firstName ? { slug: "first_name", value: input.firstName } : null,
    input.lastName ? { slug: "surname", value: input.lastName } : null,
  ].filter(Boolean);

  let id: number | null = null;
  const created = await call("/contacts", { method: "POST", json: { email: input.email, locale: "es", fields } });
  if (created.ok) {
    id = ((await created.json()) as { id: number }).id;
  } else if (created.status === 422) {
    // Ya existe: se reutiliza (y se actualiza el nombre si lo ha dado).
    id = await findContactId(input.email);
    if (id && fields.length) {
      await call(`/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/merge-patch+json" },
        body: JSON.stringify({ fields }),
      });
    }
  }
  if (!id) throw new Error(`Systeme: no se pudo crear el contacto (${created.status} ${await created.text()})`);

  const tagId = Number(process.env[TAG_ENV[input.variant]] || process.env.SYSTEME_TAG_NEWSLETTER);
  if (!tagId) throw new Error(`Systeme: falta la variable ${TAG_ENV[input.variant]} (o SYSTEME_TAG_NEWSLETTER)`);
  const tagged = await call(`/contacts/${id}/tags`, { method: "POST", json: { tagId } });
  // 422/409: el contacto ya tenía la etiqueta.
  if (!tagged.ok && tagged.status !== 422 && tagged.status !== 409) {
    throw new Error(`Systeme: no se pudo etiquetar (${tagged.status} ${await tagged.text()})`);
  }
}
