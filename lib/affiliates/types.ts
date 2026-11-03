import { z } from "zod";

/**
 * Catálogo de productos afiliados.
 *
 * Un producto es una entidad propia (content/products/<id>.json) que el
 * contenido MDX referencia por id. Cada producto tiene una o varias ofertas
 * (Amazon, Decathlon, Awin…), de forma que se puede cambiar o añadir tienda
 * sin tocar los artículos.
 */

export const MerchantIdSchema = z.enum(["amazon-es", "decathlon", "awin", "manual"]);
export type MerchantId = z.infer<typeof MerchantIdSchema>;

export const OfferSchema = z.object({
  merchant: MerchantIdSchema,
  /** ASIN en Amazon, SKU/ID de producto en otras tiendas. */
  externalId: z.string(),
  /** URL final sin parámetros de afiliado; se añaden en lib/affiliates/links.ts. */
  url: z.string().url().optional(),
  /** Precio en céntimos. Solo se muestra si `checkedAt` es reciente (ver prices.ts). */
  priceCents: z.number().int().nonnegative().nullable().default(null),
  currency: z.literal("EUR").default("EUR"),
  available: z.boolean().default(true),
  prime: z.boolean().optional(),
  checkedAt: z.string().datetime().nullable().default(null),
});
export type Offer = z.infer<typeof OfferSchema>;

export const ProductSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  /** Nombre corto para tablas y tarjetas. */
  shortName: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  image: z.string().optional(),
  features: z.array(z.string()).default([]),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  /** Valoración editorial 0-5 (no la de Amazon, que no se puede mostrar sin la API). */
  rating: z.number().min(0).max(5).optional(),
  offers: z.array(OfferSchema).min(1),
});
export type Product = z.infer<typeof ProductSchema>;
