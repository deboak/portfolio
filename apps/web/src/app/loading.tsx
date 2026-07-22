export default function Loading() {
  return (
    <div aria-label="Loading page" aria-live="polite" className="animate-pulse py-12">
      <div className="h-4 w-36 rounded-full bg-white/10" />
      <div className="mt-6 h-14 max-w-3xl rounded-2xl bg-white/10" />
      <div className="mt-4 h-14 max-w-2xl rounded-2xl bg-white/10" />
      <div className="mt-8 h-5 max-w-xl rounded-full bg-white/10" />
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="h-56 rounded-3xl bg-white/10" />
        <div className="h-56 rounded-3xl bg-white/10" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
