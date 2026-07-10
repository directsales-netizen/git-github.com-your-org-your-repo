import { ShieldAlert } from 'lucide-react';
import { getAdminSession } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { getReviewQueue } from '@/lib/chat/orders';
import { getFraudBlocklists } from '@/lib/fraud/blocklists';
import { getAllDisputes } from '@/lib/fraud/disputes';
import PageHeader from '@/components/admin/PageHeader';
import EmptyState from '@/components/admin/EmptyState';
import FraudClient from './FraudClient';

export default async function FraudDashboardPage() {
  // Same SuperAdmin-only bar as Visitor Analytics — this page surfaces IP
  // and risk-signal data most admin roles shouldn't see.
  const session = await getAdminSession();

  if (!session || session.role !== 'SuperAdmin') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Fraud Review" description="Restricted to SuperAdmin accounts." />
        <EmptyState
          icon={ShieldAlert}
          title="SuperAdmin access required"
          description="Fraud signals — IP addresses, risk scores, and review actions — are restricted to SuperAdmin accounts. Contact a SuperAdmin if you need this data."
        />
      </div>
    );
  }

  const [queue, blocklists, disputes] = await Promise.all([getReviewQueue(), getFraudBlocklists(), getAllDisputes()]);

  await logActivity({ actor: session.sub, action: 'view', target: 'fraud dashboard', detail: `${queue.length} in review queue` });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fraud Review"
        description="Orders flagged or held by the risk engine, chargebacks, and IP/country blocklists. Only extreme-risk orders are held — everything else fulfills normally and is just visible here."
      />
      <FraudClient initialQueue={queue} initialBlocklists={blocklists} initialDisputes={disputes} />
    </div>
  );
}
