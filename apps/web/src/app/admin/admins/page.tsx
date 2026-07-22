'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AdminNavigation } from '@/components/admin-navigation';
import { adminFetch } from '@/lib/admin-api';

type Admin = { id: string; email: string; createdAt: string };
const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(12),
    confirmPassword: z.string().min(12),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
type Form = z.infer<typeof schema>;

export default function AdminsPage() {
  const router = useRouter();
  const client = useQueryClient();
  const me = useQuery({ queryKey: ['me'], queryFn: () => adminFetch('/auth/me'), retry: false });
  const admins = useQuery({
    queryKey: ['admins'],
    queryFn: () => adminFetch<Admin[]>('/admin/admins'),
    enabled: me.isSuccess,
  });
  useEffect(() => {
    if (me.isError) router.replace('/admin/login');
  }, [me.isError, router]);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const create = useMutation({
    mutationFn: (data: Form) =>
      adminFetch<Admin>('/admin/admins', {
        method: 'POST',
        body: JSON.stringify({ email: data.email, password: data.password }),
      }),
    onSuccess: async () => {
      reset();
      await client.invalidateQueries({ queryKey: ['admins'] });
    },
    onError: (error) => setError('root', { message: error.message }),
  });
  if (me.isPending) return <p>Restoring secure session…</p>;
  if (me.isError) return null;
  return (
    <>
      <AdminNavigation />
      <section className="max-w-2xl">
        <p className="font-mono text-accent">Restricted administration</p>
        <h1 className="mt-2 text-4xl font-bold">Administrators</h1>
        <p className="mt-4 text-slate-400">
          Create credentials only for people who should have full content and message access.
        </p>
        <form
          className="card mt-8 grid gap-5"
          onSubmit={handleSubmit((data) => create.mutate(data))}
        >
          <label>
            Email
            <input
              type="email"
              className="mt-2 w-full rounded bg-black/30 p-3"
              {...register('email')}
            />
          </label>
          {errors.email && <p className="text-red-300">{errors.email.message}</p>}
          <label>
            Password
            <input
              type="password"
              className="mt-2 w-full rounded bg-black/30 p-3"
              {...register('password')}
            />
          </label>
          {errors.password && <p className="text-red-300">{errors.password.message}</p>}
          <label>
            Confirm password
            <input
              type="password"
              className="mt-2 w-full rounded bg-black/30 p-3"
              {...register('confirmPassword')}
            />
          </label>
          {errors.confirmPassword && (
            <p className="text-red-300">{errors.confirmPassword.message}</p>
          )}
          {errors.root && <p className="text-red-300">{errors.root.message}</p>}
          <button
            disabled={create.isPending}
            className="rounded bg-accent p-3 font-semibold text-ink"
          >
            {create.isPending ? 'Creating…' : 'Create administrator'}
          </button>
        </form>
      </section>
      <section className="mt-12 max-w-2xl">
        <h2 className="text-2xl font-bold">Current administrators</h2>
        <div className="mt-4 space-y-3">
          {admins.data?.map((admin) => (
            <div className="card flex items-center justify-between" key={admin.id}>
              <span>{admin.email}</span>
              <span className="text-sm text-slate-500">Administrator</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
