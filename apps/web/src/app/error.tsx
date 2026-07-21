'use client';

import Link from 'next/link';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-2xl py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-[.2em] text-accent">
        Something went wrong
      </p>
      <h1 className="mt-5 text-5xl font-semibold tracking-[-.04em]">This page couldn't load.</h1>
      <p className="mt-5 leading-8 text-slate-400">
        The content service may be temporarily unavailable. Try again or return home.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <button
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
          onClick={reset}
        >
          Try again
        </button>
        <Link
          className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold"
          href="/"
        >
          Home
        </Link>
      </div>
    </section>
  );
}
