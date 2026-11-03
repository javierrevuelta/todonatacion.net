/**
 * Formularios pendientes de proveedor (newsletter: Brevo/MailerLite; contacto:
 * Resend). Mientras tanto solo se ven en desarrollo, para no publicar
 * formularios que no envían nada.
 */
function Pending({ what }: { what: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="not-prose my-6 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-4 text-sm text-amber-900">
      Pendiente: {what}
    </div>
  );
}

export function Newsletter({ form }: { form?: string }) {
  return <Pending what={`formulario de newsletter (MailPoet nº ${form ?? "?"})`} />;
}

export function ContactForm() {
  return <Pending what="formulario de contacto" />;
}
