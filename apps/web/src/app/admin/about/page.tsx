'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminNavigation } from '@/components/admin-navigation';
import { adminFetch } from '@/lib/admin-api';
import type { AboutContent } from '@/lib/api';

const empty: AboutContent = {
  eyebrow: '',
  title: '',
  introTitle: '',
  intro: '',
  body: '',
  valueOneTitle: '',
  valueOneText: '',
  valueTwoTitle: '',
  valueTwoText: '',
  valueThreeTitle: '',
  valueThreeText: '',
};

export default function AboutEditor() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AboutContent>(empty);
  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => adminFetch<{ admin: { email: string } }>('/auth/me'),
    retry: false,
  });
  const about = useQuery({
    queryKey: ['admin-about'],
    queryFn: () => adminFetch<AboutContent>('/admin/about'),
    enabled: me.isSuccess,
  });
  const save = useMutation({
    mutationFn: (content: AboutContent) =>
      adminFetch<AboutContent>('/admin/about', {
        method: 'PUT',
        body: JSON.stringify(content),
      }),
    onSuccess: async (content) => {
      setForm(content);
      await queryClient.invalidateQueries({ queryKey: ['admin-about'] });
    },
  });

  useEffect(() => {
    if (me.isError) router.replace('/admin/login');
  }, [me.isError, router]);
  useEffect(() => {
    if (about.data) setForm(about.data);
  }, [about.data]);

  if (me.isPending) return <p>Restoring secure session…</p>;
  if (me.isError) return null;

  const set = (field: keyof AboutContent, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  return (
    <>
      <AdminNavigation />
      <header>
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-accent">Content</p>
        <h1 className="mt-2 text-4xl font-bold">Compose your About page</h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Changes are stored in PostgreSQL and appear on the public About page after its short cache
          refresh.
        </p>
      </header>
      {about.isPending ? (
        <div className="card mt-8 text-slate-400">Loading About content…</div>
      ) : (
        <form
          className="card mt-8 grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate(form);
          }}
        >
          <Field label="Eyebrow" value={form.eyebrow} onChange={(value) => set('eyebrow', value)} />
          <Field label="Page title" value={form.title} onChange={(value) => set('title', value)} />
          <Field
            label="Introduction title"
            value={form.introTitle}
            onChange={(value) => set('introTitle', value)}
          />
          <Field
            multiline
            label="Introduction"
            value={form.intro}
            onChange={(value) => set('intro', value)}
          />
          <Field
            multiline
            label="Second paragraph"
            value={form.body}
            onChange={(value) => set('body', value)}
          />
          <div className="grid gap-5 border-t border-white/10 pt-6 md:grid-cols-2">
            <Field
              label="Value 1 title"
              value={form.valueOneTitle}
              onChange={(value) => set('valueOneTitle', value)}
            />
            <Field
              label="Value 1 description"
              value={form.valueOneText}
              onChange={(value) => set('valueOneText', value)}
            />
            <Field
              label="Value 2 title"
              value={form.valueTwoTitle}
              onChange={(value) => set('valueTwoTitle', value)}
            />
            <Field
              label="Value 2 description"
              value={form.valueTwoText}
              onChange={(value) => set('valueTwoText', value)}
            />
            <Field
              label="Value 3 title"
              value={form.valueThreeTitle}
              onChange={(value) => set('valueThreeTitle', value)}
            />
            <Field
              label="Value 3 description"
              value={form.valueThreeText}
              onChange={(value) => set('valueThreeText', value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              className="rounded-lg bg-accent px-5 py-3 font-semibold text-white"
              disabled={save.isPending}
            >
              {save.isPending ? 'Saving…' : 'Save About page'}
            </button>
            {save.isSuccess && <span className="text-emerald-300">Saved successfully.</span>}
            {save.error && <span className="text-red-300">{save.error.message}</span>}
          </div>
        </form>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const className = 'mt-2 w-full rounded-lg p-3';
  return (
    <label className="block text-sm font-medium text-slate-300">
      {label}
      {multiline ? (
        <textarea
          className={`${className} min-h-32`}
          minLength={20}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={className}
          minLength={2}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}
