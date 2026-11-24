/**
 * Plugin de remark: convierte los <details><summary>Título</summary>…</details>
 * del contenido migrado en <Details title="Título" index={n}>…</Details>, para
 * poder darles comportamiento (p. ej. marcar sesiones hechas en los planes de
 * entrenamiento). Sin él, MDX no deja sustituir etiquetas HTML escritas como JSX.
 */
type Node = {
  type: string;
  name?: string | null;
  value?: string;
  children?: Node[];
  attributes?: { type: "mdxJsxAttribute"; name: string; value: unknown }[];
};

function text(node: Node): string {
  if (typeof node.value === "string") return node.value;
  return (node.children ?? []).map(text).join("");
}

const isJsx = (n: Node) => n.type === "mdxJsxFlowElement" || n.type === "mdxJsxTextElement";

/** Expresión literal numérica para un atributo JSX ({n}), en el formato que espera MDX. */
function numberAttr(name: string, n: number) {
  return {
    type: "mdxJsxAttribute" as const,
    name,
    value: {
      type: "mdxJsxAttributeValueExpression",
      value: String(n),
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [{ type: "ExpressionStatement", expression: { type: "Literal", value: n, raw: String(n) } }],
        },
      },
    },
  };
}

export function remarkDetails() {
  return (tree: Node) => {
    let index = 0;
    const walk = (node: Node) => {
      for (const child of node.children ?? []) walk(child);
      if (!isJsx(node) || node.name !== "details") return;
      const children = node.children ?? [];
      const summary = children.find((c) => isJsx(c) && c.name === "summary");
      node.name = "Details";
      node.children = children.filter((c) => c !== summary);
      node.attributes = [
        ...(node.attributes ?? []),
        { type: "mdxJsxAttribute", name: "title", value: summary ? text(summary).trim() : "" },
        numberAttr("index", index++),
      ];
    };
    walk(tree);
  };
}
