import madrid from "@/content/clubs/madrid.json";

/**
 * Clubes de natación de una comunidad, enlazados a sus fichas en el directorio
 * clubes.todonatacion.net. Los datos salen de content/clubs/<region>.json:
 * `featured` marca (y ordena) los destacados; el resto se ve con «Ver más».
 */
type Club = { slug: string; name: string; city?: string; featured?: number };
type ClubData = { region: string; source: string; clubs: Club[] };

const REGIONS: Record<string, ClubData> = { madrid };
const DIRECTORY = "https://clubes.todonatacion.net/clubes/";

function ClubLink({ club, compact }: { club: Club; compact?: boolean }) {
  return (
    <a
      href={`${DIRECTORY}${club.slug}`}
      className={
        compact
          ? "flex flex-col rounded-lg px-3 py-2 hover:bg-white"
          : "flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-sky-300 hover:shadow-md"
      }
    >
      <span className="font-semibold text-slate-900">{club.name}</span>
      {club.city && <span className="text-sm text-slate-600">{club.city}</span>}
    </a>
  );
}

export function ClubList({ region }: { region: string }) {
  const data = REGIONS[region];
  if (!data) return null;
  const featured = data.clubs.filter((c) => c.featured).sort((a, b) => a.featured! - b.featured!);
  const rest = data.clubs.filter((c) => !c.featured);

  return (
    <div className="not-prose my-6">
      <ul className="grid grid-cols-2 gap-2 sm:gap-3">
        {featured.map((club) => (
          <li key={club.slug}>
            <ClubLink club={club} />
          </li>
        ))}
      </ul>

      {rest.length > 0 && (
        <details className="group mt-4 rounded-xl border border-slate-200 bg-slate-50">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-sky-700 hover:bg-sky-50 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Ver más clubes ({rest.length})</span>
            <span className="hidden group-open:inline">Ver menos</span>
            <span aria-hidden className="transition group-open:rotate-180">
              ▾
            </span>
          </summary>
          <ul className="grid grid-cols-1 gap-1 px-2 pb-3 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((club) => (
              <li key={club.slug}>
                <ClubLink club={club} compact />
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="mt-3 text-sm text-slate-600">
        Fichas con dirección y contacto de cada club en el{" "}
        <a href={data.source} className="font-medium text-sky-700 underline">
          directorio de clubes de natación
        </a>
        .
      </p>
    </div>
  );
}
