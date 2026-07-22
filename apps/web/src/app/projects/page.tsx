import { ContentCard } from '@/components/content-card';
import { api, mediaUrl } from '@/lib/api';
export const metadata = { title: 'Projects' };
export const dynamic = 'force-dynamic';
export default async function Projects() {
  const projects = await api.projects();
  return (
    <>
      <header className="pb-10 pt-6 sm:pb-14 sm:pt-16">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-accent">Selected work</p>
        <h1 className="mt-4 max-w-4xl break-words text-3xl font-semibold leading-[1.12] tracking-[-.035em] sm:mt-5 sm:text-5xl md:text-7xl">
          Ideas engineered into <span className="text-slate-400">working products.</span>
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
          A closer look at the products, systems, and technical decisions behind my work.
        </p>
      </header>
      {projects.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <ContentCard
              key={project.id}
              href={`/projects/${project.slug}`}
              title={project.title}
              description={project.summary}
              tags={project.technologies}
              media={
                project.mediaAsset?.status === 'READY'
                  ? {
                      url: mediaUrl(project.mediaAsset.id),
                      type: project.mediaAsset.contentType,
                    }
                  : undefined
              }
            />
          ))}
        </section>
      ) : (
        <Empty title="No projects published yet" />
      )}
    </>
  );
}
function Empty({ title }: { title: string }) {
  return (
    <section className="rounded-[2rem] bg-white p-12 text-center shadow-soft">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-3 text-slate-400">Published work will appear here.</p>
    </section>
  );
}
