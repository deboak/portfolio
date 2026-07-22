import Link from 'next/link';
import { api, mediaUrl } from '@/lib/api';
export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await api.project(slug);
  return (
    <article>
      <Link className="text-sm font-medium text-accent hover:underline" href="/projects">
        ← All projects
      </Link>
      <header className="border-b border-black/10 pb-14 pt-10">
        <div className="grid items-center gap-7 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.8fr)]">
          <div className="order-2 lg:order-1">
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-accent">
              Project case study
            </p>
            <h1 className="mt-4 break-words text-3xl font-semibold tracking-[-.035em] sm:mt-5 sm:text-5xl md:text-7xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-slate-400 sm:mt-7 sm:text-xl sm:leading-9">
              {project.summary}
            </p>
          </div>
          {project.mediaAsset?.status === 'READY' && (
            <div className="order-1 overflow-hidden rounded-3xl bg-black/5 shadow-soft lg:order-2">
              {project.mediaAsset.contentType.startsWith('video/') ? (
                <video
                  className="aspect-video w-full object-contain"
                  src={mediaUrl(project.mediaAsset.id)}
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  className="h-auto max-h-[32rem] w-full object-contain"
                  src={mediaUrl(project.mediaAsset.id)}
                  alt={`${project.title} project preview`}
                />
              )}
            </div>
          )}
        </div>
      </header>
      <div className="grid gap-8 py-10 sm:gap-12 sm:py-14 lg:grid-cols-[1fr_18rem]">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">The work</h2>
          <p className="mt-5 max-w-3xl whitespace-pre-line text-pretty text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
            {project.description}
          </p>
          {(project.liveUrl || project.repositoryUrl) && (
            <div className="mt-8 flex gap-3">
              {project.liveUrl && (
                <a
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit project
                </a>
              )}
              {project.repositoryUrl && (
                <a
                  className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold"
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Source code
                </a>
              )}
            </div>
          )}
        </section>
        <aside className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="text-sm font-semibold uppercase tracking-[.16em] text-slate-500">
            Technology
          </h2>
          <ul className="mt-5 space-y-3">
            {project.technologies.map((item) => (
              <li
                className="border-b border-black/5 pb-3 text-sm font-medium last:border-0"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </article>
  );
}
