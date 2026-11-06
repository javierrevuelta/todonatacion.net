import type { Entry } from "@/lib/content";

/** Contenedor de Google Tag Manager (GA4 G-PJ6NMF5EHR y el resto de etiquetas viven en GTM). */
export const GTM_ID = "GTM-5CFX5MR";
/** Cuenta de AdSense: anuncios automáticos + mensaje de consentimiento de Google (Privacidad y mensajes). */
export const ADSENSE_CLIENT = "ca-pub-3758011133443292";
/**
 * Dominios donde se carga el seguimiento. En vercel.app y en local no se carga,
 * salvo que se abra la página con `?tracking=on` (se recuerda en la sesión) para probarlo.
 */
export const TRACKING_HOSTS = ["todonatacion.net", "www.todonatacion.net"];

/** Datos de página que WordPress dejaba en el dataLayer antes de GTM (mismas claves). */
export function pageData(entry: Entry) {
  const words = entry.body
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`[\]()!|-]/g, " ")
    .split(/\s+/)
    .filter((w) => /\p{L}/u.test(w)).length;
  return {
    title: entry.title,
    author: "jrgonzalez",
    wordcount: words,
    logged_in: "false",
    page_id: entry.wpId,
    post_date: entry.date.replace("T", " "),
    post_type: entry.type,
  };
}

/** JSON seguro para insertar en un <script> inline. */
export const inlineJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

/**
 * Se ejecuta al final del <body>, después de los datos de página:
 * 1. Consent Mode v2 denegado por defecto (nada de cookies de analítica ni de
 *    anuncios hasta que el usuario acepte en el mensaje de Google).
 * 2. GTM y AdSense, solo en los dominios de producción. El script de AdSense
 *    carga el mensaje de consentimiento configurado en la cuenta de AdSense,
 *    que actualiza el Consent Mode de las etiquetas de Google.
 */
export const bootstrapScript = `(function(w,d){
w.dataLayer=w.dataLayer||[];function gtag(){w.dataLayer.push(arguments);}w.gtag=w.gtag||gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
gtag('set','ads_data_redaction',true);
var on=${inlineJson(TRACKING_HOSTS)}.indexOf(location.hostname)>-1;
try{if(/[?&]tracking=on\\b/.test(location.search))sessionStorage.setItem('tn-tracking','on');on=on||sessionStorage.getItem('tn-tracking')==='on';}catch(e){}
if(!on)return;
function load(src){var s=d.createElement('script');s.async=true;s.src=src;if(/googlesyndication/.test(src))s.crossOrigin='anonymous';d.head.appendChild(s);}
w.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
load('https://www.googletagmanager.com/gtm.js?id=${GTM_ID}');
load('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}');
})(window,document);`;
