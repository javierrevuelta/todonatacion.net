import Link from "next/link";
import { AUTHOR } from "@/lib/author";

const dateFmt = new Intl.DateTimeFormat("es-ES", { dateStyle: "long" });
const day = (iso: string) => iso.slice(0, 10);

function Avatar({ size }: { size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={AUTHOR.image}
      alt={AUTHOR.imageAlt}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover ring-2 ring-white"
      style={{ width: size, height: size }}
    />
  );
}

/** Firma bajo el título: «Por Javier · Publicado el … · Actualizado el …». */
export function AuthorByline({ date, modified }: { date: string; modified?: string }) {
  const updated = modified && day(modified) > day(date) ? modified : undefined;
  return (
    <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
      <Avatar size={36} />
      <p>
        Por{" "}
        <Link href={AUTHOR.url} rel="author" className="font-semibold text-slate-800 hover:text-sky-700 hover:underline">
          {AUTHOR.name}
        </Link>
        <span aria-hidden> · </span>
        <span className="whitespace-nowrap">
          Publicado el <time dateTime={day(date)}>{dateFmt.format(new Date(date))}</time>
        </span>
        {updated && (
          <>
            <span aria-hidden> · </span>
            <span className="whitespace-nowrap">
              Actualizado el <time dateTime={day(updated)}>{dateFmt.format(new Date(updated))}</time>
            </span>
          </>
        )}
      </p>
    </div>
  );
}

/** Bloque de autor al final del artículo. */
export function AuthorBox() {
  return (
    <aside aria-label="Sobre el autor" className="not-prose mt-10 flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <Avatar size={64} />
      <div>
        <p className="font-bold text-slate-900">
          {AUTHOR.name} <span className="font-normal text-slate-500">· {AUTHOR.role}</span>
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{AUTHOR.shortBio}</p>
        <Link href={AUTHOR.url} rel="author" className="mt-2 inline-block text-sm font-semibold text-sky-700 hover:underline">
          Más sobre mí →
        </Link>
      </div>
    </aside>
  );
}
