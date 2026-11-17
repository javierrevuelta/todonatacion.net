import type { Entry } from "@/lib/content";
import { bootstrapScript, inlineJson, pageData } from "@/lib/tracking";
import { PageDataOnNavigation } from "./PageDataOnNavigation";

/** Consentimiento + GTM + AdSense. Va al final del <body>, después de los datos de página. */
export function TrackingScripts() {
  return <script id="tracking" dangerouslySetInnerHTML={{ __html: bootstrapScript }} />;
}

/**
 * Datos de la página para GTM. En la carga inicial TrackingScripts los envía antes
 * de GTM (como en WordPress); en la navegación interna de Next se envían con el
 * evento `page_data`.
 */
export function PageDataLayer({ entry }: { entry: Entry }) {
  const data = pageData(entry);
  return (
    <>
      {/* JSON y no JS: React no ejecuta <script> al navegar y avisa en desarrollo. Lo lee TrackingScripts. */}
      <script id="page-data" type="application/json" dangerouslySetInnerHTML={{ __html: inlineJson(data) }} />
      <PageDataOnNavigation data={data} />
    </>
  );
}
