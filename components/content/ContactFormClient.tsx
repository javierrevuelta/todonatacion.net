"use client";

import { useActionState, useId } from "react";
import { contactAction } from "@/app/actions/forms";
import { INITIAL_FORM_STATE } from "@/lib/forms";
import { Consent, FieldError, Honeypot, inputClass } from "./FormFields";

const label = "mb-1 block text-sm font-medium text-slate-700";

export function ContactFormClient() {
  const [state, formAction, pending] = useActionState(contactAction, INITIAL_FORM_STATE);
  const id = useId();
  const err = state.fieldErrors ?? {};
  const invalid = (name: string) =>
    err[name] ? { "aria-invalid": true as const, "aria-describedby": `${id}-${name}-error` } : {};

  if (state.status === "ok") {
    return (
      <p role="status" className="not-prose my-6 rounded-xl bg-emerald-50 p-5 font-medium text-emerald-800 ring-1 ring-emerald-200">
        ¡Gracias! Hemos recibido tu mensaje y te responderemos lo antes posible.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      aria-label="Formulario de contacto"
      className="not-prose relative my-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={label}>
            Nombre <span className="text-red-700">*</span>
          </label>
          <input id={`${id}-name`} name="name" defaultValue={state.values?.name} required autoComplete="name" className={inputClass} {...invalid("name")} />
          <FieldError id={`${id}-name-error`} message={err.name} />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={label}>
            Email <span className="text-red-700">*</span>
          </label>
          <input
            id={`${id}-email`}
            name="email"
            defaultValue={state.values?.email}
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className={inputClass}
            {...invalid("email")}
          />
          <FieldError id={`${id}-email-error`} message={err.email} />
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-subject`} className={label}>
          Asunto
        </label>
        <input id={`${id}-subject`} name="subject" defaultValue={state.values?.subject} className={inputClass} />
      </div>
      <div>
        <label htmlFor={`${id}-message`} className={label}>
          Mensaje <span className="text-red-700">*</span>
        </label>
        <textarea id={`${id}-message`} name="message" defaultValue={state.values?.message} rows={6} required minLength={10} className={inputClass} {...invalid("message")} />
        <FieldError id={`${id}-message-error`} message={err.message} />
      </div>
      <Consent purpose="responder a tu consulta" error={err.consent} />
      {state.message && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-lg bg-sky-600 px-6 py-2 font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
