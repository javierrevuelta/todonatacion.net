import type { Metadata } from "next";
import { getPosts, type Entry } from "@/lib/content";
import { PostList } from "./PostList";
import { BRANDED_TITLE_MAX } from "@/lib/seo-text";
import { SITE_URL } from "@/lib/site";
import { Mdx } from "./Mdx";
import { PageDataLayer } from "@/components/analytics/Tracking";
import { Newsletter, hasOwnForm } from "./Forms";
import { Breadcrumbs } from "./Breadcrumbs";
import { Toc } from "./Toc";
import { entryCrumbs } from "@/lib/breadcrumbs";
import { tocItems } from "@/lib/headings";
import { PlanToolbar } from "@/components/tools/TrainingPlan";
import { AuthorBox, AuthorByline } from "./Author";
import { AUTHOR, authorPerson, isSigned, publisherOrganization } from "@/lib/author";

/** Número de sesiones si la entrada es un plan de entrenamiento (≥ 6 «Sesión N» plegables). */
function planSessions(body: string): number {
  const n = (body.match(/<summary>\s*Sesi[oó]n\b/gi) ?? []).length;
  return n >= 6 ? (body.match(/<details\b/g) ?? []).length : 0;
}

export function entryMetadata(entry: Entry): Metadata {
  const title = entry.seoTitle ?? entry.title;
  return {
    // La plantilla del layout añade " - Todo Natación" solo si el título es corto.
    title: title.length <= BRANDED_TITLE_MAX ? title : { absolute: title },
    description: entry.description,
    alternates: { canonical: entry.path },
    robots: entry.noindex ? { index: false } : undefined,
    openGraph: {
      title: entry.seoTitle ?? entry.title,
      description: entry.description,
      url: entry.path,
      type: entry.type === "post" ? "article" : "website",
      images: entry.image ? [entry.image] : undefined,
    },
  };
}

function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export async function EntryView({ entry }: { entry: Entry }) {
  const signed = isSigned(entry);
  const url = new URL(entry.path, SITE_URL).toString();
  const person = authorPerson();
  const article = signed
    ? {
        "@context": "https://schema.org",
        "@type": entry.type === "post" ? "BlogPosting" : "Article",
        headline: entry.title,
        description: entry.description,
        datePublished: entry.date,
        dateModified: entry.modified ?? entry.date,
        image: entry.image ? new URL(entry.image, SITE_URL).toString() : undefined,
        mainEntityOfPage: url,
        author: { "@type": "Person", "@id": person["@id"], name: person.name, url: person.url },
        publisher: publisherOrganization(),
      }
    : null;
  // «Sobre mí» es la página de perfil del autor: ahí va el Person completo.
  const profile =
    entry.path === AUTHOR.url
      ? { "@context": "https://schema.org", "@type": "ProfilePage", url, mainEntity: person }
      : null;

  const sessions = planSessions(entry.body);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <PageDataLayer entry={entry} />
      {article && <JsonLd data={article} />}
      {profile && <JsonLd data={profile} />}
      {entry.jsonLd?.map((d, i) => <JsonLd key={i} data={d} />)}
      <Breadcrumbs items={entryCrumbs(entry)} />
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">{entry.title}</h1>
        {signed && <AuthorByline date={entry.date} modified={entry.modified} />}
      </header>
      {!entry.noindex && <Toc items={tocItems(entry.body)} />}
      {sessions > 0 && <PlanToolbar total={sessions} />}
      <div className="prose prose-slate max-w-none prose-headings:scroll-mt-20 prose-a:text-sky-700 prose-img:rounded-lg">
        <Mdx source={entry.body} plan={sessions > 0} />
      </div>
      {signed && <AuthorBox />}
      {/* Al final de cada página, la descarga de la guía (convierte más que la newsletter
          genérica), salvo en páginas que ya tienen su formulario o que no se indexan. */}
      {!entry.noindex && !hasOwnForm(entry.body) && <Newsletter form="4" />}
      {entry.path === "/blog/" && (
        <div className="mt-10">
          <PostList posts={getPosts()} />
        </div>
      )}
    </article>
  );
}
