'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const routes = ['/projects', '/blog', '/about', '/contact', '/resume'];
const apiPaths = ['/projects', '/posts'];

export function NavigationPreloader() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const warmNavigation = () => {
      if (cancelled) return;

      for (const route of routes) router.prefetch(route);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) return;

      for (const path of apiPaths) {
        void fetch(`${apiUrl}${path}`, { credentials: 'omit' }).catch(() => undefined);
      }
    };

    const timer = window.setTimeout(warmNavigation, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router]);

  return null;
}
