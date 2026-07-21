import Link from 'next/link';

export function ContentCard({
  href,
  title,
  description,
  tags = [],
}: {
  href: string;
  title: string;
  description: string;
  tags?: string[];
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-72 flex-col rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,.045)] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,.09)]"
    >
      <div className="flex items-start justify-between gap-6">
        <span className="text-xs font-semibold uppercase tracking-[.18em] text-accent">
          Case study
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-lg transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
      <div className="mt-auto pt-16">
        <h2 className="text-2xl font-semibold tracking-[-.025em]">{title}</h2>
        <p className="mt-3 max-w-xl leading-7 text-slate-400">{description}</p>
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
