import type { NextConfig } from "next";
import legacyRedirects from "./redirects.json";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  // Las URLs de WordPress terminan en "/": se mantienen idénticas por SEO.
  trailingSlash: true,
  async redirects() {
    return [
      // Sitemaps de Yoast → sitemap de Next
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/:type(post|page|category|mailpoet_page)-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/feed/", destination: "/blog/", permanent: true },
      // URLs antiguas que WordPress redirigía (plugin Redirection / slugs cambiados)
      ...legacyRedirects.map((r) => ({ ...r, permanent: true })),
    ];
  },
};

export default nextConfig;
