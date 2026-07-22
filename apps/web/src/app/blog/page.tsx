import { ContentCard } from '@/components/content-card';
import { api } from '@/lib/api';
export const metadata = { title: 'Blog' };
export const dynamic = 'force-dynamic';
export default async function Blog() {
  const posts = await api.posts();
  return (
    <>
      <header className="pb-10 pt-6 sm:pb-14 sm:pt-16">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-accent">
          Engineering journal
        </p>
        <h1 className="mt-4 max-w-4xl break-words text-3xl font-semibold leading-[1.12] tracking-[-.035em] sm:mt-5 sm:text-5xl md:text-7xl">
          Notes from building <span className="text-slate-400">real systems.</span>
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
          Technical decisions, failures, discoveries, and practical lessons from the workbench.
        </p>
      </header>
      <section className="grid gap-6">
        {posts.map((post) => (
          <ContentCard
            key={post.id}
            href={`/blog/${post.slug}`}
            title={post.title}
            description={post.excerpt}
          />
        ))}
      </section>
    </>
  );
}
