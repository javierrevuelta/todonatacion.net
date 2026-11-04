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
import { Newsletter, ContactForm } from "./Forms";
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

function Img(props: React.ComponentProps<"img">) {
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  return <img loading="lazy" decoding="async" className="mx-auto h-auto max-w-full rounded-lg" {...props} />;
}

const components: MDXComponents = {
  a: A,
  img: Img,
  ProductBox,
  ProductGrid,
  ProductList,
  ProductTable,
  YouTube,
  Embed,
  CardGrid,
  Newsletter,
  ContactForm,
  SwolfCalculator,
  CaloriesCalculator,
};

export async function Mdx({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
  });
  return <Content components={components} />;
}
