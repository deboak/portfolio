import type { Metadata } from 'next';
import Link from 'next/link';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Engineer Portfolio', template: '%s - Engineer Portfolio' },
  description: 'Full-stack engineer building reliable products and backend systems.',
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>
          <header className="site-header sticky top-0 z-50">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-base font-semibold tracking-tight">
                Akinode<span className="text-accent">.</span>
              </Link>
              <nav className="flex flex-wrap justify-end gap-6 text-sm text-slate-400">
                <Link className="hover:text-ink" href="/">
                  Home
                </Link>
                <Link className="hover:text-ink" href="/projects">
                  Projects
                </Link>
                <Link className="hover:text-ink" href="/blog">
                  Blog
                </Link>
                <Link className="hover:text-ink" href="/about">
                  About
                </Link>
                <Link className="hover:text-ink" href="/contact">
                  Contact
                </Link>
                <a className="hover:text-ink" href="/resume">
                  Resume
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto min-h-[78vh] max-w-6xl px-6 py-12">{children}</main>
          <footer className="mx-auto max-w-6xl border-t border-black/10 px-6 py-8 text-sm text-slate-500">
            Built deliberately with Next.js, Express, and PostgreSQL.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
