import Link from 'next/link';

export function ContentCard({
  href,
  title,
  description,
  tags = [],
  media,
}: {
  href: string;
  title: string;
  description: string;
  tags?: string[];
  media?: { url: string; type: string } | undefined;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-0 flex-col rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,.045)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,.09)] sm:min-h-72 sm:rounded-[2rem] sm:p-8"
    >
      {media &&
        (media.type.startsWith('video/') ? (
          <video
            className="mb-6 aspect-video w-full rounded-2xl bg-black/5 object-contain"
            src={media.url}
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            className="mb-6 aspect-video w-full rounded-2xl bg-black/5 object-contain"
            src={media.url}
            alt=""
          />
        ))}
      <div className="flex items-start justify-between gap-6">
        <span className="text-xs font-semibold uppercase tracking-[.18em] text-accent">
          Case study
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-lg transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
      <div className={`mt-auto ${media ? 'pt-6' : 'pt-10 sm:pt-16'}`}>
        <h2 className="text-2xl font-semibold tracking-[-.025em]">{title}</h2>
        <p className="mt-3 max-w-xl text-pretty leading-7 text-slate-400">{description}</p>
        {tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
