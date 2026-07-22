'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminNavigation } from '@/components/admin-navigation';
import { ContactStatusBadge, type ContactStatus } from '@/components/contact-status';
import { adminFetch } from '@/lib/admin-api';

export type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  error: string | null;
  createdAt: string;
};

type ContactPage = {
  items: Contact[];
  meta: { total: number; limit: number; nextCursor: string | null };
};

export default function Contacts() {
  const router = useRouter();
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<(string | null)[]>([]);
  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => adminFetch<{ admin: { email: string } }>('/auth/me'),
    retry: false,
  });
  const contacts = useQuery({
    queryKey: ['admin-contacts', cursor],
    queryFn: () =>
      adminFetch<ContactPage>(`/admin/contacts?limit=20${cursor ? `&cursor=${cursor}` : ''}`),
    enabled: me.isSuccess,
  });

  useEffect(() => {
    if (me.isError) router.replace('/admin/login');
  }, [me.isError, router]);

  if (me.isPending) return <p>Restoring secure session…</p>;
  if (me.isError) return null;

  const page = contacts.data;
  return (
    <>
      <AdminNavigation />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-accent">Inbox</p>
          <h1 className="mt-2 text-4xl font-bold">Contact submissions</h1>
          <p className="mt-2 text-slate-400">{page?.meta.total ?? '—'} messages in total</p>
        </div>
      </header>
      <section className="mt-8 space-y-3">
        {contacts.isPending && <div className="card text-slate-400">Loading messages…</div>}
        {page?.items.map((item) => (
          <Link
            className="card block hover:border-cyan-300/40"
            href={`/admin/contacts/${item.id}`}
            key={item.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{item.subject}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {item.name} · {item.email}
                </p>
                <p className="mt-3 line-clamp-2 text-slate-300">{item.message}</p>
              </div>
              <div className="text-right text-sm">
                <ContactStatusBadge value={item.status} />
                <time className="mt-2 block text-slate-500" dateTime={item.createdAt}>
                  {new Date(item.createdAt).toLocaleString()}
                </time>
              </div>
            </div>
          </Link>
        ))}
        {!contacts.isPending && page?.items.length === 0 && (
          <div className="card text-slate-400">No contact submissions yet.</div>
        )}
      </section>
      <div className="mt-6 flex justify-between">
        <button
          className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40"
          disabled={history.length === 0}
          onClick={() => {
            const previous = history.at(-1) ?? null;
            setHistory((items) => items.slice(0, -1));
            setCursor(previous);
          }}
        >
          Previous
        </button>
        <button
          className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40"
          disabled={!page?.meta.nextCursor}
          onClick={() => {
            if (!page?.meta.nextCursor) return;
            setHistory((items) => [...items, cursor]);
            setCursor(page.meta.nextCursor);
          }}
        >
          Next
        </button>
      </div>
    </>
  );
}
