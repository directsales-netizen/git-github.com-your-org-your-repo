import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import MaintenancePage from '@/components/MaintenancePage';
import { CartProvider } from '@/lib/cart/CartContext';
import { getCustomerSession } from '@/lib/customer/getSession';
import { getAdminSession } from '@/lib/admin/getSession';
import { getBusinessSettings } from '@/lib/admin/settings';

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const [session, settings, adminSession] = await Promise.all([
    getCustomerSession(),
    getBusinessSettings(),
    getAdminSession(),
  ]);

  // Maintenance mode replaces the entire public site — admins stay logged
  // in via a completely separate cookie/session (src/lib/admin/session.ts)
  // and see the site normally, so the team can verify things during the
  // window. /admin/* itself lives under a different layout entirely and is
  // never affected by this check either way.
  if (settings.maintenanceMode && !adminSession) {
    return <MaintenancePage />;
  }

  return (
    <CartProvider>
      <Navigation isAuthenticated={Boolean(session)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </CartProvider>
  );
}
