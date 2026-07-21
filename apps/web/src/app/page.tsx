import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const strengths = [
    ['Product clarity', 'Useful software begins with a precise understanding of the problem.'],
    ['Reliable systems', 'APIs and backend infrastructure designed to remain calm under pressure.'],
    ['Deliberate growth', 'Engineering tradeoffs documented, measured, and improved over time.'],
  ];
  return (
    <>
      <section className="pb-14 pt-16 text-center sm:pt-24">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[.22em] text-accent">
          Full-stack engineer
        </p>
        <h1 className="mx-auto max-w-5xl text-5xl font-semibold leading-[1.04] tracking-[-.045em] sm:text-7xl lg:text-[5.4rem]">
          Thoughtful products.
          <br />
          <span className="text-slate-400">Reliable systems.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
          I design polished digital experiences and build the dependable backend engineering that
          keeps them moving.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 hover:bg-blue-600"
            href="/projects"
          >
            View my work
          </Link>
          <Link
            className="rounded-full bg-black/5 px-6 py-3 text-sm font-semibold hover:bg-black/10"
            href="/contact"
          >
            Start a conversation
          </Link>
        </div>
      </section>
      <section className="relative overflow-hidden rounded-[2.5rem] bg-white shadow-soft">
        <Image
          src="/images/developer-at-work.png"
          alt="Software engineer working on a laptop in a calm studio"
          width={1536}
          height={1024}
          priority
          className="h-auto w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </section>
      <section className="py-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-accent">How I work</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-.035em] sm:text-5xl">
            Technology should feel simple.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {strengths.map(([title, description], index) => (
            <article className="card min-h-56" key={title}>
              <span className="text-sm font-semibold text-accent">0{index + 1}</span>
              <h3 className="mt-8 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 leading-7 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mb-8 rounded-[2.5rem] bg-ink px-7 py-16 text-center text-white sm:px-14">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-blue-300">
          Private access
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Manage the portfolio.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-slate-300">
          Content, messages, analytics, and background media processing live in one protected
          workspace.
        </p>
        <Link
          href="/admin/login"
          className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink hover:-translate-y-0.5"
        >
          Admin login
        </Link>
      </section>
    </>
  );
}
