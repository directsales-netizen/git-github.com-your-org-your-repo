import { getAllLoyaltyMembers, getLoyaltyRules } from '@/lib/admin/rewards';
import PageHeader from '@/components/admin/PageHeader';
import RewardsClient from './RewardsClient';

export default async function AdminRewardsPage() {
  const [members, rules] = await Promise.all([getAllLoyaltyMembers(), getLoyaltyRules()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Rewards & Loyalty" description="Manage member points and program rules." />
      <RewardsClient initialMembers={members} initialRules={rules} />
    </div>
  );
}
