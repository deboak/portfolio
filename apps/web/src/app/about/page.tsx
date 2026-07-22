import Link from 'next/link';
import { api, type AboutContent } from '@/lib/api';

export const metadata = { title: 'About' };
export const revalidate = 60;

const fallback: AboutContent = {
  eyebrow: 'About',
  title: 'Engineering with clarity, care, and curiosity.',
  introTitle: 'Hello, I’m Akinode.',
  intro:
    'I’m a full-stack engineer who turns ambiguous product needs into clear interfaces and dependable backend systems. I care about the details users feel and the infrastructure they never have to think about.',
  body: 'This portfolio is also a working engineering laboratory—where caching, queues, authentication, observability, and cloud storage are treated as real product concerns rather than afterthoughts.',
  valueOneTitle: 'Product thinking',
  valueOneText: 'Start with the outcome, then choose the technology.',
  valueTwoTitle: 'Backend depth',
  valueTwoText: 'Design for failure, visibility, and maintainable growth.',
  valueThreeTitle: 'Continuous learning',
  valueThreeText: 'Document decisions and turn mistakes into reusable knowledge.',
};

export default async function About() {
  const content = await api.about().catch(() => fallback);
  const values: [string, string][] = [
    [content.valueOneTitle, content.valueOneText],
    [content.valueTwoTitle, content.valueTwoText],
    [content.valueThreeTitle, content.valueThreeText],
  ];

  return (
    <>
      <header className="pb-16 pt-10 sm:pt-20">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-accent">
          {content.eyebrow}
        </p>
        <h1 className="mt-5 max-w-5xl text-4xl font-semibold leading-[1.1] tracking-[-.04em] sm:text-7xl">
          {content.title}
        </h1>
      </header>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-soft sm:p-12">
          <h2 className="text-2xl font-semibold">{content.introTitle}</h2>
          <p className="mt-6 text-justify text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
            {content.intro}
          </p>
          <p className="mt-5 text-justify text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
            {content.body}
          </p>
          <Link
            className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
            href="/contact"
          >
            Work with me
          </Link>
        </div>
        <div className="grid gap-5">
          {values.map(([title, text], index) => (
            <Value key={title} number={`0${index + 1}`} title={title} text={text} />
          ))}
        </div>
      </section>
    </>
  );
}

function Value({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <article className="card">
      <span className="text-sm font-semibold text-accent">{number}</span>
      <h2 className="mt-6 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-justify leading-7 text-slate-400">{text}</p>
    </article>
  );
}
