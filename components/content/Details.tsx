/** <details> normal del contenido (ver lib/mdx-details.ts). */
export function Details({ title, children }: { title: string; index?: number; children?: React.ReactNode }) {
  return (
    <details>
      <summary>{title}</summary>
      {children}
    </details>
  );
}
