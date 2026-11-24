/**
 * Formularios de la web (los que había en WordPress con MailPoet y Contact Form 7).
 * Compartido entre servidor y cliente: aquí solo hay textos y configuración.
 */

export type NewsletterVariant = "newsletter" | "guia-7-errores" | "programa-tecnica";

export type NewsletterCopy = {
  title: string;
  text: string;
  button: string;
  success: string;
  /** Pide nombre y apellido (lista de espera del Programa Técnica). */
  askName: boolean;
};

export const NEWSLETTER_COPY: Record<NewsletterVariant, NewsletterCopy> = {
  newsletter: {
    title: "¿Quieres saber más sobre natación? 👋",
    text: "Recibe en tu email consejos de técnica, entrenamientos y novedades del mundo de la natación.",
    button: "Apuntarme",
    success: "¡Gracias por apuntarte! Revisa tu bandeja de entrada (y la carpeta de spam) para confirmar tu suscripción.",
    askName: false,
  },
  "guia-7-errores": {
    title: "🏊‍♂️ Los 7 errores técnicos que te frenan en natación",
    text: "Descarga gratis la guía con los 7 errores que más te frenan en el agua y cómo corregir cada uno.",
    button: "Descargar la guía gratis",
    success: "¡Listo! Te hemos enviado la guía por email. Si no la ves en unos minutos, revisa la carpeta de spam.",
    askName: false,
  },
  "programa-tecnica": {
    title: "Apúntate a la lista de espera del Programa Técnica",
    text: "Déjanos tus datos y te avisaremos en cuanto abra la próxima edición.",
    button: "¡Apuntarme!",
    success: "¡Ya estás en la lista de espera! Te escribiremos en cuanto abra la próxima edición.",
    askName: true,
  },
};

/** id del formulario de MailPoet (como quedó en el contenido migrado) → variante. */
export const MAILPOET_FORMS: Record<string, NewsletterVariant> = {
  "1": "newsletter",
  "2": "newsletter",
  "3": "programa-tecnica",
  "4": "guia-7-errores",
  "5": "guia-7-errores",
};

export const PRIVACY_PATH = "/politica-de-privacidad/";

export type FormState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Lo que escribió la persona, para no vaciar el formulario si hay un error. */
  values?: Record<string, string>;
};
export const INITIAL_FORM_STATE: FormState = { status: "idle" };
