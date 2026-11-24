"use client";

import { useActionState, useId } from "react";
import { subscribeAction } from "@/app/actions/forms";
import { INITIAL_FORM_STATE, NEWSLETTER_COPY, type NewsletterVariant } from "@/lib/forms";
import { Consent, FieldError, Honeypot, inputClass } from "./FormFields";

const PURPOSE: Record<NewsletterVariant, string> = {
  newsletter: "enviarte la newsletter de Todo Natación",
  "guia-7-errores": "enviarte la guía y la newsletter de Todo Natación",
  "programa-tecnica": "avisarte de la apertura del Programa Técnica y enviarte la newsletter",
};

export function NewsletterForm({ variant }: { variant: NewsletterVariant }) {
  const copy = NEWSLETTER_COPY[variant];
  const action = subscribeAction.bind(null, variant);
  const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
  const id = useId();
  const err = state.fieldErrors ?? {};

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="not-prose relative my-8 rounded-2xl border border-sky-200 bg-sky-50 p-5 sm:p-6"
    >
      <h2 id={`${id}-title`} className="text-xl font-bold text-slate-900">
        {copy.title}
      </h2>
      {state.status === "ok" ? (
        <p role="status" className="mt-3 rounded-lg bg-white p-4 font-medium text-emerald-800 ring-1 ring-emerald-200">
          {copy.success}
        </p>
      ) : (
        <>
          <p className="mt-2 text-slate-700">{copy.text}</p>
          <form action={formAction} className="relative mt-4 flex flex-col gap-3">
            <Honeypot />
            {copy.askName && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor={`${id}-first`} className="sr-only">
                    Nombre
                  </label>
                  <input
                    id={`${id}-first`}
                    name="firstName"
                    defaultValue={state.values?.firstName}
                    placeholder="Nombre"
                    autoComplete="given-name"
                    required
                    aria-invalid={err.firstName ? true : undefined}
                    aria-describedby={err.firstName ? `${id}-first-error` : undefined}
                    className={inputClass}
                  />
                  <FieldError id={`${id}-first-error`} message={err.firstName} />
                </div>
                <div>
                  <label htmlFor={`${id}-last`} className="sr-only">
                    Apellido
                  </label>
                  <input id={`${id}-last`} name="lastName" defaultValue={state.values?.lastName} placeholder="Apellido" autoComplete="family-name" className={inputClass} />
                </div>
              </div>
            )}
            <div>
              <div>
                <label htmlFor={`${id}-email`} className="sr-only">
                  Email
                </label>
                <input
                  id={`${id}-email`}
                  name="email"
                  defaultValue={state.values?.email}
                  type="email"
                  required
                  placeholder="Tu email"
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={err.email ? true : undefined}
                  aria-describedby={err.email ? `${id}-email-error` : undefined}
                  className={inputClass}
                />
                <FieldError id={`${id}-email-error`} message={err.email} />
              </div>
            </div>
            <Consent purpose={PURPOSE[variant]} error={err.consent} />
            {state.message && (
              <p role="alert" className="text-sm font-medium text-red-700">
                {state.message}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-700 disabled:opacity-60 sm:self-start"
            >
              {pending ? "Enviando…" : copy.button}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
