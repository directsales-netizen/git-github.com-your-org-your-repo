import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/getSession';
import { getLowStockProducts } from '@/lib/api';
import { getAllAppointments } from '@/lib/chat/appointments';
import AdminShell from '@/components/admin/AdminShell';
import type { AdminNotification } from '@/components/admin/AdminTopbar';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth beyond src/proxy.ts — belt-and-suspenders in case
  // the proxy matcher config ever drifts.
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  // NOTE: role is intentionally NOT gated here — admin/editor/viewer accounts
  // still get the full dashboard. Only Visitor Analytics (a SuperAdmin-only
  // module, see src/app/admin/(dashboard)/visitor-analytics/page.tsx) checks
  // session.role. Don't add a dashboard-wide SuperAdmin gate here without
  // confirming with the team — it would lock every non-SuperAdmin admin
  // account out of unrelated modules (inventory, orders, etc).

  const [lowStock, appointments] = await Promise.all([getLowStockProducts(), getAllAppointments()]);

  const notifications: AdminNotification[] = [
    ...lowStock.slice(0, 3).map((product) => ({
      id: `stock-${product.id}`,
      message: `${product.title} is low on stock (${product.stock} left).`,
      tone: 'warning' as const,
    })),
    ...appointments
      .filter((a) => a.status === 'pending')
      .slice(0, 2)
      .map((a) => ({
        id: `apt-${a.id}`,
        message: `New ${a.type} request awaiting confirmation.`,
        tone: 'info' as const,
      })),
  ];

  return (
    <AdminShell adminEmail={session.sub} adminRole={session.role} notifications={notifications}>
      {children}
    </AdminShell>
  );
}
