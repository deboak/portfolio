'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/resume', label: 'Resume' },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-xl md:hidden"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">{open ? '×' : '☰'}</span>
      </button>
      <nav
        id="primary-navigation"
        aria-label="Primary navigation"
        className={`${
          open ? 'flex' : 'hidden'
        } absolute right-0 top-12 min-w-52 flex-col gap-1 rounded-2xl border border-white/10 bg-[#111114]/95 p-2 text-sm shadow-2xl backdrop-blur-2xl md:static md:flex md:min-w-0 md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
      >
        {links.map(({ href, label }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={active ? 'nav-link nav-link-active' : 'nav-link'}
              href={href}
              key={href}
              prefetch
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
