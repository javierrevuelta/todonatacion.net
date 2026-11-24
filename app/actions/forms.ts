"use server";

import { z } from "zod";
import { MAILPOET_FORMS, type FormState, type NewsletterVariant } from "@/lib/forms";
import { subscribe, systemeConfigured } from "@/lib/systeme";
import { contactConfigured, deliverContact } from "@/lib/contact";

const DEV = process.env.NODE_ENV !== "production";

/** Campo trampa: invisible para las personas, los bots lo rellenan. */
const isBot = (formData: FormData) => Boolean(formData.get("website"));

const email = z.string().trim().toLowerCase().min(1, "Escribe tu email.").email("Escribe un email válido.").max(254);
const consent = z.literal("on", { error: "Tienes que aceptar la política de privacidad." });
const optional = (max: number) => z.string().trim().max(max).optional();

const NewsletterSchema = z.object({
  email,
  consent,
  firstName: optional(80),
  lastName: optional(80),
});

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

/** Siempre devuelve texto ("" si falta), para que los mensajes de error sean los nuestros. */
const value = (formData: FormData, key: string) => {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
};

/** Valores a devolver si hay error (sin el consentimiento ni el campo trampa). */
const echo = (formData: FormData, keys: string[]) => Object.fromEntries(keys.map((k) => [k, value(formData, k)]));

export async function subscribeAction(variant: NewsletterVariant, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!Object.values(MAILPOET_FORMS).includes(variant)) return { status: "error", message: "Formulario no válido." };
  if (isBot(formData)) return { status: "ok" };
  const values = echo(formData, ["email", "firstName", "lastName"]);

  const parsed = NewsletterSchema.safeParse({
    email: value(formData, "email"),
    consent: value(formData, "consent"),
    firstName: value(formData, "firstName"),
    lastName: value(formData, "lastName"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };
  if (variant === "programa-tecnica" && !parsed.data.firstName) {
    return { status: "error", fieldErrors: { firstName: "Escribe tu nombre." }, values };
  }

  if (!systemeConfigured()) {
    if (DEV) {
      console.info("[newsletter] (sin Systeme, solo desarrollo)", variant, parsed.data.email);
      return { status: "ok" };
    }
    return { status: "error", message: "El formulario no está disponible ahora mismo. Inténtalo más tarde.", values };
  }

  try {
    await subscribe({ variant, ...parsed.data });
    return { status: "ok" };
  } catch (error) {
    console.error("[newsletter]", error);
    return { status: "error", message: "No hemos podido apuntarte. Inténtalo de nuevo en unos minutos.", values };
  }
}

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre.").max(120),
  email,
  subject: optional(200),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mínimo 10 caracteres).").max(5000),
  consent,
});

export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (isBot(formData)) return { status: "ok" };
  const values = echo(formData, ["name", "email", "subject", "message"]);

  const parsed = ContactSchema.safeParse({
    name: value(formData, "name"),
    email: value(formData, "email"),
    subject: value(formData, "subject"),
    message: value(formData, "message"),
    consent: value(formData, "consent"),
  });
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  if (!contactConfigured()) {
    if (DEV) {
      console.info("[contacto] (sin envío configurado, solo desarrollo)", parsed.data.email, parsed.data.subject);
      return { status: "ok" };
    }
    return { status: "error", message: "El formulario no está disponible ahora mismo. Escríbenos a hola@todonatacion.net.", values };
  }

  try {
    await deliverContact(parsed.data);
    return { status: "ok" };
  } catch (error) {
    console.error("[contacto]", error);
    return { status: "error", message: "No hemos podido enviar tu mensaje. Inténtalo de nuevo o escríbenos a hola@todonatacion.net.", values };
  }
}
