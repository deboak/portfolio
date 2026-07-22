'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/contacts', label: 'Contacts' },
  { href: '/admin/about', label: 'About' },
  { href: '/admin#projects', label: 'Projects' },
  { href: '/admin#blog', label: 'Blog' },
  { href: '/admin#media', label: 'Media' },
  { href: '/admin/admins', label: 'Administrators' },
];

export function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav className="card mb-8 flex flex-wrap items-center gap-2 text-sm">
      {links.map(({ href, label }) => {
        const route = href.split('#')[0];
        const active = route !== '/' && pathname === route;
        return (
          <Link
            className={
              active
                ? 'rounded-lg bg-cyan-300/10 px-3 py-2 text-cyan-200'
                : 'rounded-lg px-3 py-2 hover:bg-white/10'
            }
            href={href}
            key={href}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
