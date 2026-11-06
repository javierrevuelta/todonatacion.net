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
 *    carga el mensaje de consentimiento configurado en la cuenta de AdSense;
 *    el puente TCF de abajo traslada la elección al Consent Mode.
 */
export const bootstrapScript = `(function(w,d){
w.dataLayer=w.dataLayer||[];function gtag(){w.dataLayer.push(arguments);}w.gtag=w.gtag||gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
gtag('set','ads_data_redaction',true);
var on=${inlineJson(TRACKING_HOSTS)}.indexOf(location.hostname)>-1;
try{if(/[?&]tracking=on\\b/.test(location.search))sessionStorage.setItem('tn-tracking','on');on=on||sessionStorage.getItem('tn-tracking')==='on';}catch(e){}
if(!on)return;
function load(src){var s=d.createElement('script');s.async=true;s.src=src;if(/googlesyndication/.test(src))s.crossOrigin='anonymous';d.head.appendChild(s);}
// Puente TCF → Consent Mode: el aviso de Google guarda la elección en formato
// TCF (__tcfapi) pero no actualiza el Consent Mode de GA4/AdSense por sí solo.
// Correspondencia de Google: P1 almacenamiento, P3+P4 personalización, P7 medición; vendor 755 = Google.
var tries=0,last='';
function bridge(){
  if(typeof w.__tcfapi!=='function'){if(++tries<40)setTimeout(bridge,250);return;}
  w.__tcfapi('addEventListener',2,function(t,ok){
    if(!ok||!t||(t.eventStatus!=='tcloaded'&&t.eventStatus!=='useractioncomplete'))return;
    var g='granted',n='denied',s;
    if(t.gdprApplies===false){s={ad_storage:g,ad_user_data:g,ad_personalization:g,analytics_storage:g};}
    else{var p=(t.purpose&&t.purpose.consents)||{},v=!!(t.vendor&&t.vendor.consents&&t.vendor.consents[755]);
      s={ad_storage:p[1]&&v?g:n,ad_user_data:p[1]&&p[7]&&v?g:n,ad_personalization:p[3]&&p[4]&&v?g:n,analytics_storage:p[1]?g:n};}
    var k=JSON.stringify(s);if(k!==last){last=k;gtag('consent','update',s);w.dataLayer.push({event:'consent_update'});}
  });
}
bridge();
w.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
load('https://www.googletagmanager.com/gtm.js?id=${GTM_ID}');
load('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}');
})(window,document);`;
