import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/getSession';
import { getLowStockProducts } from '@/lib/api';
import { getAllAppointments } from '@/lib/chat/appointments';
import { getAllVisitorRequests } from '@/lib/admin/requests';
import { REQUEST_KIND_LABELS } from '@/lib/admin/requestLabels';
import AdminShell from '@/components/admin/AdminShell';
import type { AdminNotification } from '@/components/admin/AdminTopbar';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth beyond src/proxy.ts — belt-and-suspenders in case
  // the proxy matcher config ever drifts.
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  // Any authenticated admin role gets into the dashboard shell — modules
  // that must stay SuperAdmin-only (Users & Roles, Settings, Visitor
  // Analytics, Live Chat Takeover) add their own page-level guard instead,
  // and their API routes are gated separately (src/lib/admin/getSession.ts).

  const [lowStock, appointments, visitorRequests] = await Promise.all([
    getLowStockProducts(),
    getAllAppointments(),
    getAllVisitorRequests(),
  ]);

  const notifications: AdminNotification[] = [
    ...visitorRequests
      .filter((r) => !r.read)
      .slice(0, 5)
      .map((r) => ({
        id: `request-${r.id}`,
        message: `New ${REQUEST_KIND_LABELS[r.kind].toLowerCase()} — ${r.clientName ?? r.email ?? r.phone ?? 'visitor'} (${r.id}).`,
        tone: 'info' as const,
      })),
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
