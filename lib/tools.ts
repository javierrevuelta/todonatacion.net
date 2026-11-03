/** Lógica pura de las calculadoras (misma fórmula que la versión de WordPress). */

export const CALORIES_PER_KG_MINUTE = {
  crol: 0.08,
  espalda: 0.075,
  braza: 0.1,
  mariposa: 0.13,
} as const;

export type SwimStyle = keyof typeof CALORIES_PER_KG_MINUTE;

export function caloriesBurned(style: SwimStyle, weightKg: number, minutes: number): number {
  return Math.round(CALORIES_PER_KG_MINUTE[style] * weightKg * minutes);
}

/** SWOLF = segundos en recorrer un largo + brazadas en ese largo. */
export function swolf(seconds: number, strokes: number): number {
  return Math.round(seconds + strokes);
}
