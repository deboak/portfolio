'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminNavigation } from '@/components/admin-navigation';
import { ContactStatusBadge } from '@/components/contact-status';
import { adminFetch } from '@/lib/admin-api';

type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'FAILED';
  error: string | null;
  createdAt: string;
};

export default function ContactDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => adminFetch<{ admin: { email: string } }>('/auth/me'),
    retry: false,
  });
  const contact = useQuery({
    queryKey: ['admin-contact', id],
    queryFn: () => adminFetch<Contact>(`/admin/contacts/${id}`),
    enabled: me.isSuccess && Boolean(id),
  });

  useEffect(() => {
    if (me.isError) router.replace('/admin/login');
  }, [me.isError, router]);

  if (me.isPending || contact.isPending) return <p>Loading message…</p>;
  if (me.isError) return null;
  if (contact.isError) return <p className="text-red-300">{contact.error.message}</p>;

  const item = contact.data;
  return (
    <>
      <AdminNavigation />
      <Link className="text-sm text-accent hover:underline" href="/admin/contacts">
        ← Back to inbox
      </Link>
      <article className="card mt-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold">{item.subject}</h1>
            <p className="mt-2 text-slate-400">From {item.name}</p>
            <a
              className="mt-1 inline-block text-cyan-200 hover:underline"
              href={`mailto:${item.email}`}
            >
              {item.email}
            </a>
          </div>
          <div className="text-right">
            <ContactStatusBadge value={item.status} />
            <time className="mt-3 block text-sm text-slate-500" dateTime={item.createdAt}>
              {new Date(item.createdAt).toLocaleString()}
            </time>
          </div>
        </div>
        <p className="whitespace-pre-wrap py-8 text-lg leading-8 text-slate-300">{item.message}</p>
        {item.error && (
          <p className="rounded-lg bg-red-500/10 p-4 text-red-300">Delivery error: {item.error}</p>
        )}
        <a
          className="mt-6 inline-block rounded-lg bg-accent px-5 py-3 font-semibold text-white"
          href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}
        >
          Reply by email
        </a>
      </article>
    </>
  );
}
