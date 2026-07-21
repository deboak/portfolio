import Link from 'next/link';
export const metadata = { title: 'About' };
export default function About() {
  return (
    <>
      <header className="pb-16 pt-10 sm:pt-20">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-accent">About</p>
        <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[1.06] tracking-[-.045em] sm:text-7xl">
          Engineering with clarity, <span className="text-slate-400">care, and curiosity.</span>
        </h1>
      </header>
      <section className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-soft sm:p-12">
          <h2 className="text-2xl font-semibold">Hello, I’m Akinode.</h2>
          <p className="mt-6 text-lg leading-9 text-slate-300">
            I’m a full-stack engineer who turns ambiguous product needs into clear interfaces and
            dependable backend systems. I care about the details users feel and the infrastructure
            they never have to think about.
          </p>
          <p className="mt-5 text-lg leading-9 text-slate-300">
            This portfolio is also a working engineering laboratory—where caching, queues,
            authentication, observability, and cloud storage are treated as real product concerns
            rather than afterthoughts.
          </p>
          <Link
            className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
            href="/contact"
          >
            Work with me
          </Link>
        </div>
        <div className="grid gap-5">
          <Value
            number="01"
            title="Product thinking"
            text="Start with the outcome, then choose the technology."
          />
          <Value
            number="02"
            title="Backend depth"
            text="Design for failure, visibility, and maintainable growth."
          />
          <Value
            number="03"
            title="Continuous learning"
            text="Document decisions and turn mistakes into reusable knowledge."
          />
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
      <p className="mt-2 leading-7 text-slate-400">{text}</p>
    </article>
  );
}
