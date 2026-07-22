'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(160),
  message: z.string().min(20).max(5000),
});
type Form = z.infer<typeof schema>;
const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <>
      <header className="pb-10 pt-6 sm:pb-14 sm:pt-16">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-accent">Contact</p>
        <h1 className="mt-4 max-w-4xl break-words text-3xl font-semibold leading-[1.12] tracking-[-.035em] sm:mt-5 sm:text-5xl md:text-7xl">
          Let's make something <span className="text-slate-400">worth using.</span>
        </h1>
      </header>
      <div className="grid overflow-hidden rounded-[2.25rem] bg-white shadow-soft lg:grid-cols-[.75fr_1.25fr]">
        <aside className="bg-ink p-5 text-white sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[.16em] text-blue-300">
            Start a conversation
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            Tell me what you're building.
          </h2>
          <p className="mt-5 leading-8 text-white/65">
            Your message is saved immediately, then delivered through the background job system.
            I'll reply by email.
          </p>
          <div className="mt-12 border-t border-white/15 pt-6 text-sm text-white/60">
            Typically responds within two business days.
          </div>
        </aside>
        <form
          className="grid gap-5 p-5 sm:p-12"
          onSubmit={handleSubmit(async (data) => {
            try {
              const response = await fetch(`${api}/contact`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(data),
              });
              const body = await response.json();
              if (!response.ok) throw new Error(body?.error?.message ?? 'Unable to send message');
              reset();
            } catch (error) {
              setError('root', {
                message: error instanceof Error ? error.message : 'Unable to send message',
              });
            }
          })}
        >
          <Field label="Name" error={errors.name?.message}>
            <input className="mt-2 w-full rounded-xl p-3.5" {...register('name')} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input type="email" className="mt-2 w-full rounded-xl p-3.5" {...register('email')} />
          </Field>
          <Field label="Subject" error={errors.subject?.message}>
            <input className="mt-2 w-full rounded-xl p-3.5" {...register('subject')} />
          </Field>
          <Field label="Message" error={errors.message?.message}>
            <textarea className="mt-2 min-h-40 w-full rounded-xl p-3.5" {...register('message')} />
          </Field>
          {errors.root && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.root.message}</p>
          )}
          {isSubmitSuccessful && !errors.root && (
            <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
              Message queued successfully. Thank you.
            </p>
          )}
          <button
            disabled={isSubmitting}
            className="rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 hover:bg-blue-600"
          >
            {isSubmitting ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </div>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm font-medium">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
