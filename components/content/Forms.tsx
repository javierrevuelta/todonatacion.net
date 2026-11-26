import { MAILPOET_FORMS } from "@/lib/forms";
import { systemeConfigured } from "@/lib/systeme";
import { contactConfigured } from "@/lib/contact";
import { NewsletterForm } from "./NewsletterForm";
import { ContactFormClient } from "./ContactFormClient";

/**
 * Formularios de newsletter (Systeme) y contacto (Resend). En producción solo se
 * muestran si su servicio está configurado, para no publicar formularios que no
 * envían nada; en desarrollo se ven siempre (el envío se simula en la consola).
 */
const DEV = process.env.NODE_ENV !== "production";

/** `form` es el id de MailPoet que dejó la migración (ver MAILPOET_FORMS). */
export function Newsletter({
  form,
  title,
  text,
  button,
}: {
  form?: string;
  /** Textos propios para un bloque concreto (p. ej. el de «Sobre mí»). */
  title?: string;
  text?: string;
  button?: string;
}) {
  if (!DEV && !systemeConfigured()) return null;
  return <NewsletterForm variant={MAILPOET_FORMS[form ?? ""] ?? "newsletter"} copy={{ title, text, button }} />;
}

export function ContactForm() {
  if (!DEV && !contactConfigured()) {
    return (
      <p className="not-prose my-6 rounded-xl border border-slate-200 bg-white p-5">
        Escríbenos a{" "}
        <a href="mailto:hola@todonatacion.net" className="font-semibold text-sky-700 underline">
          hola@todonatacion.net
        </a>{" "}
        y te responderemos lo antes posible.
      </p>
    );
  }
  return <ContactFormClient />;
}

/** Bloque de newsletter general que WordPress ponía debajo de cada página (formulario 2). */
export function hasOwnForm(body: string): boolean {
  return /<(Newsletter|ContactForm)\b/.test(body);
}
