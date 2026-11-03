import type { MerchantId, Offer } from "../types";

/**
 * Cada tienda implementa un adaptador con la misma forma. La tarea programada
 * (app/api/cron/prices) recorre los adaptadores configurados, pide las
 * ofertas actualizadas y las guarda en el PriceStore.
 */
export interface MerchantAdapter {
  id: MerchantId;
  /** false si faltan credenciales: el cron lo salta sin fallar. */
  isConfigured(): boolean;
  fetchOffers(externalIds: string[]): Promise<Offer[]>;
}

/**
 * Amazon: la PA-API 5 se está sustituyendo por la Creators API y ambas exigen
 * un mínimo de ventas cualificadas recientes. Pendiente de implementar cuando
 * se confirme qué acceso tiene la cuenta.
 */
export const amazonAdapter: MerchantAdapter = {
  id: "amazon-es",
  isConfigured: () =>
    Boolean(process.env.AMAZON_API_CLIENT_ID && process.env.AMAZON_API_CLIENT_SECRET),
  async fetchOffers() {
    throw new Error("Adaptador de Amazon pendiente de implementar");
  },
};

export const adapters: MerchantAdapter[] = [amazonAdapter];
