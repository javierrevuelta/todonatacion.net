import { getProducts } from "@/lib/affiliates/catalog";
import { OfferButton, ProductImage } from "./OfferButton";

type ExtraRow = { label: string; values: string[] };

/**
 * Tabla comparativa. En escritorio, una columna por producto; en móvil, una
 * tarjeta por producto. `ribbons` y `rows` van en el mismo orden que `ids`.
 */
export function ProductTable({
  ids,
  ribbons = [],
  rows = [],
}: {
  ids: string[];
  ribbons?: (string | null)[];
  rows?: ExtraRow[];
}) {
  const products = getProducts(ids);
  // Si falta algún producto, los índices de ribbons/rows dejan de cuadrar.
  const index = (id: string) => ids.indexOf(id);

  return (
    <div className="not-prose my-6">
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
        <table className="w-full table-fixed border-collapse bg-white text-sm">
          <tbody>
            <tr>
              {products.map((p) => (
                <td key={p.id} className="border-b border-slate-100 p-3 text-center align-top">
                  {ribbons[index(p.id)] && (
                    <span className="mb-2 inline-block rounded bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white">
                      {ribbons[index(p.id)]}
                    </span>
                  )}
                  <ProductImage product={p} size={120} />
                </td>
              ))}
            </tr>
            <tr>
              {products.map((p) => (
                <td key={p.id} className="border-b border-slate-100 p-3 text-center align-top font-semibold">
                  <span className="line-clamp-3">{p.shortName ?? p.name}</span>
                </td>
              ))}
            </tr>
            {rows.map((row) => (
              <tr key={row.label}>
                {products.map((p) => (
                  <td key={p.id} className="border-b border-slate-100 p-3 text-center align-top">
                    <span className="block text-xs text-slate-500">{row.label}</span>
                    {row.values[index(p.id)] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center">
                  <OfferButton product={p} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {products.map((p) => (
          <div key={p.id} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="w-24">
              <ProductImage product={p} size={96} />
            </div>
            <div className="flex flex-1 flex-col gap-2 text-sm">
              {ribbons[index(p.id)] && (
                <span className="self-start rounded bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {ribbons[index(p.id)]}
                </span>
              )}
              <span className="line-clamp-3 font-semibold">{p.shortName ?? p.name}</span>
              {rows.map((row) => (
                <span key={row.label} className="text-slate-600">
                  {row.label}: {row.values[index(p.id)] ?? "—"}
                </span>
              ))}
              <OfferButton product={p} className="self-start" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
