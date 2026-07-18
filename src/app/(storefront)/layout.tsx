import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import MaintenancePage from '@/components/MaintenancePage';
import OrdersPausedBanner from '@/components/OrdersPausedBanner';
import EditModeProvider from '@/components/EditModeProvider';
import { CartProvider } from '@/lib/cart/CartContext';
import { WishlistProvider } from '@/lib/customer/WishlistContext';
import { getCustomerSession } from '@/lib/customer/getSession';
import { getAdminSession } from '@/lib/admin/getSession';
import { getBusinessSettings } from '@/lib/admin/settings';
import SmoothScrollProvider from '@/components/animations/SmoothScrollProvider';
import ScrollProgress from '@/components/animations/ScrollProgress';
import PageTransition from '@/components/animations/PageTransition';
import AnimatedStoryboardBackdrop from '@/components/sections/AnimatedStoryboardBackdrop';

const EDITOR_ROLES = ['editor', 'admin', 'SuperAdmin'];

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
  // never affected by this check either way. The chat widget stays available
  // (opt-in, same as always — visitors still have to click to open it) so a
  // visitor isn't fully locked out of reaching support during the window.
  if (settings.maintenanceMode && !adminSession) {
    return (
      <>
        <MaintenancePage />
        <ChatWidget />
      </>
    );
  }

  const canEdit = Boolean(adminSession) && EDITOR_ROLES.includes(adminSession!.role);

  return (
    <EditModeProvider canEdit={canEdit}>
      <CartProvider ordersPaused={settings.ordersPaused}>
        <WishlistProvider isAuthenticated={Boolean(session)}>
          <div className="relative isolate min-h-screen overflow-x-hidden bg-bg-primary">
            <AnimatedStoryboardBackdrop placement="storefront" />
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 z-0 opacity-[0.1] [background-image:radial-gradient(circle,rgba(56,232,232,0.55)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_78%)]"
            />
            <div className="relative z-10 flex min-h-screen flex-col">
              <SmoothScrollProvider />
              <ScrollProgress />
              {settings.ordersPaused && <OrdersPausedBanner supportEmail={settings.supportEmail} />}
              <Navigation isAuthenticated={Boolean(session)} />
              <main className="flex-1">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
              <ChatWidget />
            </div>
          </div>
        </WishlistProvider>
      </CartProvider>
    </EditModeProvider>
  );
}
