import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import { ProductBox, ProductGrid, ProductList } from "@/components/affiliate/ProductBox";
import { ProductTable } from "@/components/affiliate/ProductTable";
import { AFFILIATE_REL, AMAZON_TAG } from "@/lib/affiliates/links";
import { YouTube, Embed } from "./Embeds";
import { CardGrid } from "./CardGrid";
import { ClubList } from "./Clubs";
import { ImageGrid } from "./ImageGrid";
import { Newsletter, ContactForm } from "./Forms";
import { slugify } from "@/lib/headings";
import { remarkDetails } from "@/lib/mdx-details";
import { Details } from "./Details";
import { LatestPosts } from "./PostList";
import { SessionDetails } from "@/components/tools/TrainingPlan";
import { SwolfCalculator, CaloriesCalculator } from "@/components/tools/Calculators";

/** Enlaces del contenido: internos con <Link>, Amazon con tag y rel="sponsored". */
function A({ href = "", children, ...rest }: React.ComponentProps<"a">) {
  if (href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/wp-content/")) {
    return <Link href={href}>{children}</Link>;
  }
  if (/^https:\/\/www\.amazon\.es\//.test(href)) {
    const url = new URL(href);
    url.searchParams.set("tag", AMAZON_TAG);
    return (
      <a href={url.toString()} rel={AFFILIATE_REL} target="_blank">
        {children}
      </a>
    );
  }
  const external = /^https?:\/\//.test(href);
  return (
    <a href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})} {...rest}>
      {children}
    </a>
  );
}

/** Texto de los hijos de un encabezado, para generar su id (ver lib/headings.ts). */
function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}

/** h2 con id para el índice de contenidos y enlaces directos a apartados. */
function H2({ children, ...rest }: React.ComponentProps<"h2">) {
  return (
    <h2 id={slugify(textOf(children)) || undefined} {...rest}>
      {children}
    </h2>
  );
}

function Img(props: React.ComponentProps<"img">) {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img loading="lazy" decoding="async" className="mx-auto h-auto max-w-full rounded-lg" {...props} />;
}

const components: MDXComponents = {
  a: A,
  h2: H2,
  img: Img,
  ProductBox,
  ProductGrid,
  ProductList,
  ProductTable,
  YouTube,
  Embed,
  CardGrid,
  ClubList,
  ImageGrid,
  Newsletter,
  ContactForm,
  SwolfCalculator,
  CaloriesCalculator,
  Details,
  LatestPosts,
};

/** En los planes de entrenamiento, cada <details> es una sesión que se puede marcar como hecha. */
const planComponents: MDXComponents = { ...components, Details: SessionDetails };

export async function Mdx({ source, plan = false }: { source: string; plan?: boolean }) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm, remarkDetails],
  });
  return <Content components={plan ? planComponents : components} />;
}
