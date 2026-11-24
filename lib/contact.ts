import "server-only";

/**
 * Envío del formulario de contacto por email con Resend (https://resend.com).
 * Variables de entorno:
 *   RESEND_API_KEY   clave de Resend (con el dominio todonatacion.net verificado)
 *   CONTACT_TO       buzón que recibe los mensajes (por defecto hola@todonatacion.net)
 *   CONTACT_FROM     remitente verificado (por defecto "Todo Natación <web@todonatacion.net>")
 * Se responde directamente al remitente gracias a reply_to.
 */
export function contactConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function deliverContact(input: { name: string; email: string; subject?: string; message: string }): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Todo Natación <web@todonatacion.net>",
      to: [process.env.CONTACT_TO ?? "hola@todonatacion.net"],
      reply_to: `${input.name} <${input.email}>`,
      subject: `[Contacto web] ${input.subject || `Mensaje de ${input.name}`}`,
      text: `Nombre: ${input.name}\nEmail: ${input.email}\nAsunto: ${input.subject ?? "-"}\n\n${input.message}`,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Resend: ${res.status} ${await res.text()}`);
}
