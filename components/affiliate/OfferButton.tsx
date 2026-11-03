import { AFFILIATE_REL, merchantLabel, offerHref, primaryOffer } from "@/lib/affiliates/links";
import { displayPrice } from "@/lib/affiliates/prices";
import type { Product } from "@/lib/affiliates/types";

export function OfferButton({ product, className = "" }: { product: Product; className?: string }) {
  const offer = primaryOffer(product);
  const price = displayPrice(offer);
  return (
    <a
      href={offerHref(product, offer)}
      rel={AFFILIATE_REL}
      target="_blank"
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-amber-300 ${className}`}
    >
      {price ? `${price} en ${merchantLabel(offer.merchant)}` : `Ver precio en ${merchantLabel(offer.merchant)}`}
    </a>
  );
}

export function ProductImage({ product, size = 160 }: { product: Product; size?: number }) {
  if (!product.image) return null;
  const offer = primaryOffer(product);
  return (
    <a href={offerHref(product, offer)} rel={AFFILIATE_REL} target="_blank" className="block shrink-0">
      {/* Imágenes servidas por Amazon: next/image no aporta aquí y su uso está restringido. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.image}
        alt={product.name}
        width={size}
        height={size}
        loading="lazy"
        className="mx-auto h-auto max-h-40 w-auto object-contain"
      />
    </a>
  );
}
