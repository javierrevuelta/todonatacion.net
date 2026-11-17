/** Lógica pura de las calculadoras de /recursos/. */

export type SwimStyle = "crol" | "espalda" | "braza" | "mariposa";
export type Intensity = "suave" | "entrenamiento";

/**
 * METs del Compendium of Physical Activities (2024, actividades acuáticas):
 * crol 18240 / 18230, espalda 18255 / 18250, braza 18265 / 18260 y mariposa
 * 18270 (solo tiene un valor general). https://pacompendium.com/water-activities/
 */
export const SWIM_METS: Record<SwimStyle, Record<Intensity, number>> = {
  crol: { suave: 5.8, entrenamiento: 9.8 },
  espalda: { suave: 4.8, entrenamiento: 9.5 },
  braza: { suave: 5.3, entrenamiento: 10.3 },
  mariposa: { suave: 13.8, entrenamiento: 13.8 },
};

export const SWIM_STYLES = Object.keys(SWIM_METS) as SwimStyle[];

/** kcal = MET × peso (kg) × horas. Es el gasto total, incluido el de estar en reposo. */
export function caloriesBurned(style: SwimStyle, intensity: Intensity, weightKg: number, minutes: number): number {
  return Math.round(SWIM_METS[style][intensity] * weightKg * (minutes / 60));
}

/** SWOLF de un largo = segundos en recorrerlo + brazadas en ese largo. */
export function swolf(seconds: number, strokes: number): number {
  return Math.round(seconds + strokes);
}

/** SWOLF medio de una serie: (tiempo total + brazadas totales) / número de largos. */
export function averageSwolf(totalSeconds: number, totalStrokes: number, lengths: number): number {
  return Math.round((totalSeconds + totalStrokes) / lengths);
}
