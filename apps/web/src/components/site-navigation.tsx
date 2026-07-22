'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <nav aria-label="Primary navigation" className="flex flex-wrap justify-end gap-1 text-sm">
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
  );
}
