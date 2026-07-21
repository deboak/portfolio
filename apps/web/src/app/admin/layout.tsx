import type { Metadata } from 'next';
import { LiveNotifications } from '@/components/live-notifications';

export const metadata: Metadata = {
  title: 'Administration',
  description: 'Private portfolio administration workspace.',
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="admin-shell">
      {children}
      <LiveNotifications />
    </section>
  );
}
