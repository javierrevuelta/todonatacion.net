import { getProduct } from "@/lib/affiliates/catalog";
import { merchantUrl } from "@/lib/affiliates/links";

/**
 * Redirección de afiliado para tiendas que no son Amazon: /go/<producto>/<tienda>/.
 * Aquí se registrará el clic cuando haya base de datos.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string; merchant: string }> },
) {
  const { productId, merchant } = await params;
  const offer = getProduct(productId)?.offers.find((o) => o.merchant === merchant);
  if (!offer) return new Response("Not found", { status: 404 });

  return new Response(null, {
    status: 302,
    headers: {
      Location: merchantUrl(offer),
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
