/** Vídeo de YouTube sin cookies hasta que el usuario lo reproduce. */
export function YouTube({ id, title = "Vídeo de YouTube" }: { id: string; title?: string }) {
  return (
    <div className="not-prose my-6 aspect-video overflow-hidden rounded-xl bg-slate-900">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full"
      />
    </div>
  );
}

export function Embed({ src }: { src: string }) {
  return (
    <div className="not-prose my-6 aspect-video overflow-hidden rounded-xl">
      <iframe src={src} loading="lazy" className="h-full w-full" title="Contenido incrustado" />
    </div>
  );
}
