import { getCustomerSession } from '@/lib/customer/getSession';
import { findCustomerAccountByEmail } from '@/lib/customer/store';
import { getLoyaltyMemberByEmail } from '@/lib/admin/rewards';
import { cardVariants, cn } from '@/design';
import LogoutButton from './LogoutButton';
import VerifiedBanner from './VerifiedBanner';

export default async function AccountOverviewPage() {
  const session = await getCustomerSession();
  if (!session) return null; // layout already redirects; satisfies TypeScript narrowing

  const [account, loyalty] = await Promise.all([
    findCustomerAccountByEmail(session.sub),
    getLoyaltyMemberByEmail(session.sub),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <VerifiedBanner />

      <div className={cn(cardVariants.base, 'flex flex-wrap items-center justify-between gap-4')}>
        <div>
          <p className="text-h5 font-heading font-semibold text-neutral-white">{account?.name ?? session.sub}</p>
          <p className="text-body-sm font-body text-neutral-silver">{session.sub}</p>
          {account && !account.emailVerified && (
            <p className="mt-1 text-caption font-body text-warning">Email not verified yet — check your inbox for a verification link.</p>
          )}
        </div>
        <LogoutButton />
      </div>

      <div className={cardVariants.base}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Rewards</h2>
        {loyalty ? (
          <div className="mt-3 flex items-center gap-6">
            <div>
              <p className="text-h3 font-heading font-bold text-accent-primary">{loyalty.points.toLocaleString()}</p>
              <p className="text-caption font-body text-neutral-silver">Points</p>
            </div>
            <div>
              <p className="text-h5 font-heading font-semibold text-neutral-white">{loyalty.tier}</p>
              <p className="text-caption font-body text-neutral-silver">Tier</p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-body-sm font-body text-neutral-silver">Earn points on your first order.</p>
        )}
      </div>
    </div>
  );
}
