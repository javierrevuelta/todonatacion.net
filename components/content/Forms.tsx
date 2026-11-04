import Link from "next/link";

/**
 * Formularios pendientes de proveedor (newsletter: Brevo/MailerLite; contacto:
 * Resend). Mientras tanto solo se ven en desarrollo, para no publicar
 * formularios que no envían nada.
 */
const SHOW_PENDING = process.env.NODE_ENV !== "production";

/** Página de privacidad a la que enlazan los formularios. Debe existir antes de activarlos. */
const PRIVACY_PATH = "/politica-de-privacidad/";

function Pending({ what }: { what: string }) {
  if (!SHOW_PENDING) return null;
  return (
    <div className="not-prose my-6 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4 text-sm text-amber-900">
      Pendiente: {what}
    </div>
  );
}

/**
 * Copy por formulario de MailPoet. El 4 y el 5 entregan el lead magnet
 * "Los 7 errores técnicos"; el 3 es la lista del Programa Técnica.
 */
const NEWSLETTER_COPY = {
  "lead-magnet": {
    title: "Los 7 errores técnicos que te frenan en natación",
    text: "Descarga gratis la guía con los 7 errores que más te frenan en el agua y cómo corregir cada uno.",
    button: "Descargar la guía gratis",
    askName: false,
  },
  "programa-tecnica": {
    title: "Apúntate al Programa Técnica",
    text: "Déjanos tu email y te avisamos cuando abra la próxima edición.",
    button: "Apuntarme",
    askName: true,
  },
} as const;

const FORM_VARIANT: Record<string, keyof typeof NEWSLETTER_COPY> = {
  "3": "programa-tecnica",
  "4": "lead-magnet",
  "5": "lead-magnet",
};

export function Newsletter({ form }: { form?: string }) {
  if (!SHOW_PENDING) return null;
  const copy = NEWSLETTER_COPY[FORM_VARIANT[form ?? ""] ?? "lead-magnet"];
  const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base";
  return (
    <section className="not-prose relative my-8 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-6">
      <span className="absolute -top-3 right-4 rounded bg-amber-400 px-2 py-0.5 text-xs font-semibold text-slate-900">
        Pendiente: proveedor de newsletter
      </span>
      <h2 className="text-xl font-bold text-slate-900">{copy.title}</h2>
      <p className="mt-2 text-slate-700">{copy.text}</p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" aria-label={copy.title}>
        {copy.askName && <input name="name" placeholder="Nombre" autoComplete="given-name" className={field} disabled />}
        <input
          name="email"
          type="email"
          required
          placeholder="Tu email"
          autoComplete="email"
          className={field}
          disabled
        />
        <button
          type="submit"
          disabled
          className="shrink-0 rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {copy.button}
        </button>
      </form>
      <p className="mt-3 text-xs text-slate-500">
        Sin spam: puedes darte de baja cuando quieras. Lee la{" "}
        <Link href={PRIVACY_PATH} className="underline">
          política de privacidad
        </Link>
        .
      </p>
    </section>
  );
}

export function ContactForm() {
  return <Pending what="formulario de contacto" />;
}
