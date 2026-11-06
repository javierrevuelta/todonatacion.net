"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// La primera página ya dejó sus datos con el <script> inline; aquí solo las siguientes.
let firstRender = true;

export function PageDataOnNavigation({ data }: { data: Record<string, unknown> }) {
  useEffect(() => {
    if (firstRender) {
      firstRender = false;
      return;
    }
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: "page_data", ...data });
  }, [data]);
  return null;
}
