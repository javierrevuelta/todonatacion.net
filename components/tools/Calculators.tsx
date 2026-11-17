"use client";

import { useState } from "react";
import { SWIM_METS, SWIM_STYLES, averageSwolf, caloriesBurned, type Intensity, type SwimStyle } from "@/lib/tools";

const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base";
const label = "flex flex-col gap-1 text-sm font-medium text-slate-700";
const button = "rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700";
const box = "not-prose my-6 grid gap-4 rounded-xl border border-slate-200 bg-sky-50 p-4 sm:p-5";
const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);
const decimal = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 1 });

type SwolfResult = { value: number; lengths: number; pool: number; secondsPerLength: number; strokesPerLength: number };

export function SwolfCalculator() {
  const [result, setResult] = useState<SwolfResult | null>(null);
  return (
    <form
      className={`${box} sm:grid-cols-2`}
      aria-label="Calculadora SWOLF"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const lengths = Number(data.get("lengths"));
        const seconds = Number(data.get("minutes") || 0) * 60 + Number(data.get("seconds") || 0);
        const strokes = Number(data.get("strokes"));
        if (!lengths || !seconds || !strokes) return setResult(null);
        setResult({
          value: averageSwolf(seconds, strokes, lengths),
          lengths,
          pool: Number(data.get("pool")),
          secondsPerLength: seconds / lengths,
          strokesPerLength: strokes / lengths,
        });
      }}
    >
      <label className={label}>
        Piscina
        <select name="pool" className={field} defaultValue="25">
          <option value="25">25 metros</option>
          <option value="50">50 metros</option>
        </select>
      </label>
      <label className={label}>
        Largos nadados
        <input name="lengths" type="number" min="1" max="400" step="1" defaultValue="1" required inputMode="numeric" className={field} />
      </label>
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="mb-1 text-sm font-medium text-slate-700">Tiempo total</legend>
        <label className={label}>
          <span className="text-xs font-normal text-slate-500">Minutos</span>
          <input name="minutes" type="number" min="0" step="1" placeholder="min" inputMode="numeric" className={field} />
        </label>
        <label className={label}>
          <span className="text-xs font-normal text-slate-500">Segundos</span>
          <input name="seconds" type="number" min="0" step="any" placeholder="seg" inputMode="decimal" className={field} />
        </label>
      </fieldset>
      <label className={label}>
        Brazadas totales
        <input name="strokes" type="number" min="1" step="1" required inputMode="numeric" className={field} />
      </label>
      <button type="submit" className={`${button} sm:col-span-2`}>
        Calcular SWOLF
      </button>
      {result && (
        <div className="sm:col-span-2" aria-live="polite">
          <p className="text-lg font-semibold text-slate-900">
            SWOLF{result.lengths > 1 ? " medio" : ""}: {result.value}{" "}
            <span className="text-sm font-normal text-slate-600">(piscina de {result.pool} m)</span>
          </p>
          {result.lengths > 1 && (
            <p className="mt-1 text-sm text-slate-600">
              Por largo: {decimal(result.secondsPerLength)} s y {decimal(result.strokesPerLength)} brazadas.
            </p>
          )}
          <p className="mt-1 text-sm text-slate-600">Compáralo solo con tus series en piscinas de {result.pool} m y en el mismo estilo.</p>
        </div>
      )}
    </form>
  );
}

export function CaloriesCalculator() {
  const [style, setStyle] = useState<SwimStyle>("crol");
  const [result, setResult] = useState<number | null>(null);
  const singleIntensity = SWIM_METS[style].suave === SWIM_METS[style].entrenamiento;
  return (
    <form
      className={`${box} sm:grid-cols-2`}
      aria-label="Calculadora de calorías nadando"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setResult(
          caloriesBurned(
            style,
            (data.get("intensity") as Intensity | null) ?? "entrenamiento",
            Number(data.get("weight")),
            Number(data.get("minutes")),
          ),
        );
      }}
    >
      <label className={label}>
        Peso (kg)
        <input name="weight" type="number" min="20" max="250" step="any" required inputMode="decimal" className={field} />
      </label>
      <label className={label}>
        Tiempo nadando (minutos)
        <input name="minutes" type="number" min="1" max="600" step="1" required inputMode="numeric" className={field} />
      </label>
      <label className={label}>
        Estilo
        <select
          name="style"
          className={field}
          value={style}
          onChange={(e) => {
            setStyle(e.target.value as SwimStyle);
            setResult(null);
          }}
        >
          {SWIM_STYLES.map((s) => (
            <option key={s} value={s}>
              {capitalize(s)}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Intensidad
        <select name="intensity" className={field} defaultValue="entrenamiento" disabled={singleIntensity}>
          <option value="suave">Suave, a ritmo de paseo</option>
          <option value="entrenamiento">Entrenamiento, ritmo exigente</option>
        </select>
        {singleIntensity && <span className="text-xs font-normal text-slate-500">La mariposa es exigente a cualquier ritmo.</span>}
      </label>
      <button type="submit" className={`${button} sm:col-span-2`}>
        Calcular calorías
      </button>
      {result !== null && (
        <p className="text-lg font-semibold text-slate-900 sm:col-span-2" aria-live="polite">
          Unas {result} kcal{" "}
          <span className="text-sm font-normal text-slate-600">(estimación; tu gasto real puede variar)</span>
        </p>
      )}
    </form>
  );
}
