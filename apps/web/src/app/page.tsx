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
        <h1 className="mx-auto max-w-5xl text-4xl font-semibold leading-[1.08] tracking-[-.04em] sm:text-7xl lg:text-[5.4rem]">
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
      <section className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-soft">
        <Image
          src="/images/akinode-portrait.png"
          alt="Akinode in a black suit"
          width={1254}
          height={1254}
          priority
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
      </section>
      <section className="py-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-accent">How I work</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-.035em] sm:text-5xl">
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
    </>
  );
}
