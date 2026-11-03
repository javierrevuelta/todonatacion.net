import { getProduct, getProducts } from "@/lib/affiliates/catalog";
import { AFFILIATE_REL, offerHref, primaryOffer } from "@/lib/affiliates/links";
import type { Product } from "@/lib/affiliates/types";
import { OfferButton, ProductImage } from "./OfferButton";

function Ribbon({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-2 left-3 rounded bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white">
      {children}
    </span>
  );
}

function Title({ product, clamp = false }: { product: Product; clamp?: boolean }) {
  return (
    <a
      href={offerHref(product, primaryOffer(product))}
      rel={AFFILIATE_REL}
      target="_blank"
      className={`font-semibold text-slate-900 hover:text-sky-700 ${clamp ? "line-clamp-2" : ""}`}
    >
      {product.shortName ?? product.name}
    </a>
  );
}

/** Ficha destacada de un producto (sustituye a la caja horizontal de AAWP). */
export function ProductBox({ id, ribbon }: { id: string; ribbon?: string }) {
  const product = getProduct(id);
  if (!product) return null;
  return (
    <div className="not-prose relative my-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
      {ribbon && <Ribbon>{ribbon}</Ribbon>}
      <ProductImage product={product} />
      <div className="flex flex-1 flex-col gap-3">
        <Title product={product} />
        {product.features.length > 0 && (
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            {product.features.slice(0, 5).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
        <OfferButton product={product} className="self-start" />
      </div>
    </div>
  );
}

/** Rejilla de productos, p. ej. "los más vendidos" (sustituye a la vista vertical de AAWP). */
export function ProductGrid({ ids, numbered = true }: { ids: string[]; numbered?: boolean }) {
  const products = getProducts(ids);
  return (
    <div className="not-prose my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 pt-5 shadow-sm"
        >
          {numbered && <Ribbon>Nº {i + 1}</Ribbon>}
          <ProductImage product={product} />
          <Title product={product} clamp />
          <OfferButton product={product} className="mt-auto" />
        </div>
      ))}
    </div>
  );
}

/** Lista compacta de productos (sustituye a la vista lista de AAWP). */
export function ProductList({ ids }: { ids: string[] }) {
  const products = getProducts(ids);
  return (
    <ul className="not-prose my-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
      {products.map((product) => (
        <li key={product.id} className="flex items-center gap-4 p-3">
          <div className="w-20">
            <ProductImage product={product} size={80} />
          </div>
          <div className="flex flex-1 flex-col gap-2 text-sm">
            <Title product={product} clamp />
            <OfferButton product={product} className="self-start" />
          </div>
        </li>
      ))}
    </ul>
  );
}
