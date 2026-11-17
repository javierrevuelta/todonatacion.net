"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

// La primera página ya dejó sus datos al cargar (TrackingScripts); aquí solo las
// siguientes. Se recuerda la última enviada para no duplicarla (Strict Mode, re-renders).
let lastSent: string | null = null;

export function PageDataOnNavigation({ data }: { data: Record<string, unknown> }) {
  useEffect(() => {
    const key = JSON.stringify(data);
    if (lastSent === null || lastSent === key) {
      lastSent = key;
      return;
    }
    lastSent = key;
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: "page_data", ...data });
  }, [data]);
  return null;
}
