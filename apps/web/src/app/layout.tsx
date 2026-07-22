import type { Metadata } from 'next';
import Link from 'next/link';
import { NavigationPreloader } from '@/components/navigation-preloader';
import { Providers } from '@/components/providers';
import { SiteNavigation } from '@/components/site-navigation';
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
          <NavigationPreloader />
          <header className="site-header sticky top-0 z-50">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
              <Link href="/" className="text-base font-semibold tracking-tight">
                Akinode<span className="text-accent">.</span>
              </Link>
              <SiteNavigation />
            </div>
          </header>
          <main className="mx-auto min-h-[78vh] max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
            {children}
          </main>
          <footer className="mx-auto max-w-6xl border-t border-black/10 px-4 py-8 text-sm text-slate-500 sm:px-6">
            © 2026 Akinode Adebowale. All rights reserved.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
