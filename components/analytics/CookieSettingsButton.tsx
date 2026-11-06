"use client";

type GoogleFc = { callbackQueue: unknown[]; showRevocationMessage: () => void };

/** Reabre el mensaje de consentimiento de Google para cambiar la elección. */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const w = window as unknown as { googlefc?: GoogleFc };
        w.googlefc = w.googlefc ?? ({ callbackQueue: [] } as unknown as GoogleFc);
        w.googlefc.callbackQueue.push(() => w.googlefc!.showRevocationMessage());
      }}
    >
      Configurar cookies
    </button>
  );
}
