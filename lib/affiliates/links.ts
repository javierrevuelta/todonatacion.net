import type { MerchantId, Offer, Product } from "./types";

/**
 * Único punto donde se construyen enlaces de afiliado. Nunca escribas un
 * enlace de Amazon a mano en el contenido: así el tag y el país siempre son
 * correctos (en WordPress había ~119 enlaces a amazon.de con el tag de .es).
 */

export const AMAZON_TAG = process.env.AMAZON_ASSOCIATE_TAG ?? "todonatacion-21";

export const AFFILIATE_REL = "sponsored nofollow noopener";

const MERCHANT_LABELS: Record<MerchantId, string> = {
  "amazon-es": "Amazon",
  decathlon: "Decathlon",
  awin: "Tienda",
  manual: "Tienda",
};

export function merchantLabel(merchant: MerchantId): string {
  return MERCHANT_LABELS[merchant];
}

/** URL final con los parámetros de afiliado de cada tienda. */
export function merchantUrl(offer: Offer): string {
  switch (offer.merchant) {
    case "amazon-es": {
      const url = new URL(`https://www.amazon.es/dp/${offer.externalId}`);
      url.searchParams.set("tag", AMAZON_TAG);
      return url.toString();
    }
    default:
      if (!offer.url) throw new Error(`Oferta ${offer.merchant}:${offer.externalId} sin url`);
      return offer.url;
  }
}

/**
 * Enlace que se pinta en la página. Amazon se enlaza directo (lo más seguro
 * frente al Operating Agreement); el resto pasa por /go/ para medir clics y
 * poder cambiar de red sin tocar el contenido.
 */
export function offerHref(product: Product, offer: Offer): string {
  if (offer.merchant === "amazon-es") return merchantUrl(offer);
  return `/go/${product.id}/${offer.merchant}/`;
}

/** Oferta principal: la disponible más barata con precio, o la primera disponible. */
export function primaryOffer(product: Product): Offer {
  const available = product.offers.filter((o) => o.available);
  const pool = available.length ? available : product.offers;
  const priced = pool.filter((o) => o.priceCents != null);
  if (priced.length) return priced.reduce((a, b) => (a.priceCents! <= b.priceCents! ? a : b));
  return pool[0];
}
