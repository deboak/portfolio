import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { api } from '@/lib/api';
const format = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'Africa/Lagos' });
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await api.post(slug);
  return (
    <article className="mx-auto max-w-3xl">
      <Link className="text-sm font-medium text-accent hover:underline" href="/blog">
        ← All writing
      </Link>
      <header className="border-b border-black/10 pb-12 pt-10">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-accent">
          {post.publishedAt ? format.format(new Date(post.publishedAt)) : 'Draft'}
        </p>
        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-6xl">
          {post.title}
        </h1>
        <p className="mt-6 text-xl leading-8 text-slate-400">{post.excerpt}</p>
      </header>
      <div className="prose py-12 text-lg leading-9">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
