"use client";

import { useState } from "react";
import { CALORIES_PER_KG_MINUTE, caloriesBurned, swolf, type SwimStyle } from "@/lib/tools";

const field = "w-full rounded-lg border border-slate-300 px-3 py-2 text-base";
const label = "flex flex-col gap-1 text-sm font-medium text-slate-700";
const button = "rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700";

export function SwolfCalculator() {
  const [result, setResult] = useState<number | null>(null);
  return (
    <form
      className="not-prose my-6 grid gap-4 rounded-xl border border-slate-200 bg-sky-50 p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setResult(swolf(Number(data.get("seconds")), Number(data.get("strokes"))));
      }}
    >
      <label className={label}>
        Tiempo por largo (segundos)
        <input name="seconds" type="number" min="1" step="any" required inputMode="decimal" className={field} />
      </label>
      <label className={label}>
        Número de brazadas
        <input name="strokes" type="number" min="1" step="1" required inputMode="numeric" className={field} />
      </label>
      <button type="submit" className={`${button} sm:col-span-2`}>
        Calcular SWOLF
      </button>
      {result !== null && (
        <p className="text-lg font-semibold sm:col-span-2" aria-live="polite">
          Tu puntuación SWOLF es: {result}
        </p>
      )}
    </form>
  );
}

export function CaloriesCalculator() {
  const [result, setResult] = useState<number | null>(null);
  return (
    <form
      className="not-prose my-6 grid gap-4 rounded-xl border border-slate-200 bg-sky-50 p-4 sm:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setResult(
          caloriesBurned(data.get("style") as SwimStyle, Number(data.get("weight")), Number(data.get("minutes"))),
        );
      }}
    >
      <label className={label}>
        Peso (kg)
        <input name="weight" type="number" min="20" max="250" required inputMode="decimal" className={field} />
      </label>
      <label className={label}>
        Tiempo nadando (minutos)
        <input name="minutes" type="number" min="1" max="600" required inputMode="numeric" className={field} />
      </label>
      <label className={label}>
        Estilo
        <select name="style" className={field} defaultValue="crol">
          {Object.keys(CALORIES_PER_KG_MINUTE).map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className={`${button} sm:col-span-3`}>
        Calcular calorías
      </button>
      {result !== null && (
        <p className="text-lg font-semibold sm:col-span-3" aria-live="polite">
          Calorías quemadas: {result} kcal
        </p>
      )}
    </form>
  );
}
