"use client";

import Link from "next/link";
import { useId } from "react";
import { PRIVACY_PATH } from "@/lib/forms";

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 aria-[invalid=true]:border-red-500";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-700">
      {message}
    </p>
  );
}

/** Campo trampa para bots: fuera de la vista, sin tabulación ni autocompletado. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        No rellenes este campo
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

/** Casilla de consentimiento + primera capa de información (RGPD / LOPDGDD). */
export function Consent({ purpose, error }: { purpose: string; error?: string }) {
  const id = useId();
  return (
    <div className="text-sm text-slate-600">
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-4 shrink-0 accent-sky-600"
        />
        <span>
          He leído y acepto la{" "}
          <Link href={PRIVACY_PATH} className="underline" target="_blank">
            política de privacidad
          </Link>
          .
        </span>
      </label>
      <FieldError id={`${id}-error`} message={error} />
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Responsable: Javier Revuelta González. Finalidad: {purpose}. Legitimación: tu consentimiento. Destinatarios:
        proveedores que nos prestan el servicio. Derechos: acceso, rectificación, supresión y los demás que explicamos en la
        política de privacidad.
      </p>
    </div>
  );
}
