import "server-only";
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { ProductSchema, type Product } from "./types";

const PRODUCTS_DIR = path.join(process.cwd(), "content", "products");

export const getCatalog = cache((): Map<string, Product> => {
  const catalog = new Map<string, Product>();
  if (!fs.existsSync(PRODUCTS_DIR)) return catalog;
  for (const file of fs.readdirSync(PRODUCTS_DIR)) {
    if (!file.endsWith(".json")) continue;
    const raw = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, file), "utf8"));
    const parsed = ProductSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Producto inválido en ${file}: ${parsed.error.message}`);
    }
    catalog.set(parsed.data.id, parsed.data);
  }
  return catalog;
});

export function getProduct(id: string): Product | undefined {
  return getCatalog().get(id);
}

/** Devuelve los productos en el orden pedido, ignorando ids desconocidos (con aviso en dev). */
export function getProducts(ids: string[]): Product[] {
  const catalog = getCatalog();
  return ids.flatMap((id) => {
    const product = catalog.get(id);
    if (!product && process.env.NODE_ENV !== "production") {
      console.warn(`[affiliates] Producto desconocido: ${id}`);
    }
    return product ? [product] : [];
  });
}

export function getProductsByCategory(category: string, limit?: number): Product[] {
  const list = [...getCatalog().values()].filter((p) => p.category === category);
  return limit ? list.slice(0, limit) : list;
}
