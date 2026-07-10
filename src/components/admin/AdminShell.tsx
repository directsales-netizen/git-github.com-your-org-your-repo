'use client';

import { useState } from 'react';
import { cn } from '@/design';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import type { SessionRole } from '@/lib/admin/session';
import AdminSidebar from './AdminSidebar';
import AdminTopbar, { type AdminNotification } from './AdminTopbar';
import Drawer from './Drawer';
import OtpGateModal from './OtpGateModal';

interface AdminShellProps {
  adminEmail: string;
  adminRole: SessionRole;
  notifications: AdminNotification[];
  children: React.ReactNode;
}

export default function AdminShell({ adminEmail, adminRole, notifications, children }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed] = useSidebarCollapsed();

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary print:block print:h-auto print:overflow-visible">
      <aside
        className={cn(
          'hidden shrink-0 border-r border-neutral-titanium/20 transition-all duration-300 desktop:block print:hidden',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <AdminSidebar adminRole={adminRole} />
      </aside>

      <Drawer isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title="Menu">
        <AdminSidebar onNavigate={() => setMobileNavOpen(false)} />
      </Drawer>

      <div className="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible">
        <div className="print:hidden">
          <AdminTopbar adminEmail={adminEmail} notifications={notifications} onMenuClick={() => setMobileNavOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 tablet:p-6 print:overflow-visible print:p-0">{children}</main>
      </div>

      <OtpGateModal />
    </div>
  );
}
