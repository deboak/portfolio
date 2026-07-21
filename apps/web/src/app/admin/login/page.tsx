'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { login } from '@/lib/admin-api';

const schema = z.object({ email: z.string().email(), password: z.string().min(12) });
type Form = z.infer<typeof schema>;

export default function Login() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-[2.25rem] bg-white shadow-soft md:grid-cols-2">
      <aside className="bg-ink p-9 text-white sm:p-12">
        <Link className="text-sm text-white/60 hover:text-white" href="/">
          &larr; Return home
        </Link>
        <p className="mt-16 text-sm font-semibold uppercase tracking-[.18em] text-blue-300">
          Private workspace
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-.035em]">
          Portfolio administration.
        </h1>
        <p className="mt-5 leading-8 text-white/65">
          Manage content, messages, analytics, administrators, and background media processing.
        </p>
      </aside>
      <section className="p-9 sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-accent">
          Secure access
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">Welcome back.</h2>
        <form
          className="mt-9 space-y-5"
          onSubmit={handleSubmit(async (values) => {
            try {
              await login(values.email, values.password);
              router.replace('/admin');
            } catch (error) {
              setError('root', {
                message: error instanceof Error ? error.message : 'Login failed',
              });
            }
          })}
        >
          <label className="block text-sm font-medium">
            Email
            <input className="mt-2 w-full rounded-xl p-3.5" type="email" {...register('email')} />
          </label>
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          <label className="block text-sm font-medium">
            Password
            <input
              className="mt-2 w-full rounded-xl p-3.5"
              type="password"
              {...register('password')}
            />
          </label>
          {errors.root && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.root.message}</p>
          )}
          <button
            disabled={isSubmitting}
            className="w-full rounded-full bg-accent p-3.5 text-sm font-semibold text-white hover:bg-blue-600"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </div>
  );
}
