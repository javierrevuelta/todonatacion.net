import type { Entry } from "@/lib/content";
import { bootstrapScript, inlineJson, pageData } from "@/lib/tracking";
import { PageDataOnNavigation } from "./PageDataOnNavigation";

/** Consentimiento + GTM + AdSense. Va al final del <body>, después de los datos de página. */
export function TrackingScripts() {
  return <script id="tracking" dangerouslySetInnerHTML={{ __html: bootstrapScript }} />;
}

/**
 * Datos de la página para GTM. En la carga inicial se insertan antes de GTM (como
 * en WordPress); en la navegación interna de Next se envían con el evento `page_data`.
 */
export function PageDataLayer({ entry }: { entry: Entry }) {
  const data = pageData(entry);
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];window.dataLayer.push(${inlineJson(data)});`,
        }}
      />
      <PageDataOnNavigation data={data} />
    </>
  );
}
