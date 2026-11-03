import type { Offer } from "./types";

/**
 * Amazon exige que un precio mostrado tenga menos de 24 h. Si el precio es
 * más antiguo (o no existe), los componentes muestran "Ver precio" en su lugar.
 */
export const PRICE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function isPriceFresh(offer: Offer, now = Date.now()): boolean {
  if (offer.priceCents == null || !offer.checkedAt) return false;
  return now - new Date(offer.checkedAt).getTime() < PRICE_MAX_AGE_MS;
}

const formatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function displayPrice(offer: Offer, now = Date.now()): string | null {
  return isPriceFresh(offer, now) ? formatter.format(offer.priceCents! / 100) : null;
}
