'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import type { LoyaltyMember, LoyaltyRules } from '@/types/admin';
import { accessibility, buttonVariants, cardVariants, cn, spacing } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { TextField } from '@/components/admin/FormFields';

const TIER_TONE: Record<LoyaltyMember['tier'], 'neutral' | 'info' | 'warning' | 'success'> = {
  Bronze: 'neutral',
  Silver: 'info',
  Gold: 'warning',
  Platinum: 'success',
};

export default function RewardsClient({ initialMembers, initialRules }: { initialMembers: LoyaltyMember[]; initialRules: LoyaltyRules }) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [rules, setRules] = useState(initialRules);
  const [isSaving, setIsSaving] = useState(false);

  async function adjustPoints(member: LoyaltyMember, delta: number) {
    const response = await adminFetch(`/api/admin/rewards/members/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    });
    if (response.ok) {
      const updated: LoyaltyMember = await response.json();
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      router.refresh();
    }
  }

  async function saveRules() {
    setIsSaving(true);
    const response = await adminFetch('/api/admin/rewards/rules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rules),
    });
    if (response.ok) {
      setRules(await response.json());
      router.refresh();
    }
    setIsSaving(false);
  }

  const columns: Column<LoyaltyMember>[] = [
    { key: 'name', header: 'Member', sortValue: (m) => m.name, render: (m) => <span className="font-medium text-neutral-white">{m.name}</span> },
    { key: 'email', header: 'Email', sortValue: (m) => m.email },
    { key: 'points', header: 'Points', sortValue: (m) => m.points, render: (m) => m.points.toLocaleString() },
    { key: 'tier', header: 'Tier', sortValue: (m) => m.tier, render: (m) => <StatusBadge tone={TIER_TONE[m.tier]} label={m.tier} /> },
    { key: 'joinedDate', header: 'Joined', sortValue: (m) => m.joinedDate },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DataTable
        columns={columns}
        rows={members}
        getRowId={(m) => m.id}
        searchable
        searchPlaceholder="Search members…"
        searchKeys={['name', 'email']}
        emptyMessage="No loyalty members yet."
        rowActions={(m) => (
          <div className="flex items-center justify-end gap-1">
            <button type="button" aria-label={`Remove 100 points from ${m.name}`} onClick={() => adjustPoints(m, -100)} className={cn('rounded-md p-1.5 text-neutral-silver hover:text-error', accessibility.focusRing)}>
              <Minus size={14} aria-hidden="true" />
            </button>
            <button type="button" aria-label={`Add 100 points to ${m.name}`} onClick={() => adjustPoints(m, 100)} className={cn('rounded-md p-1.5 text-neutral-silver hover:text-accent-primary', accessibility.focusRing)}>
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      />

      <div className={cn(cardVariants.base, 'max-w-lg')}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Program rules</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <TextField id="pointsPerDollar" label="Points per $1 spent" type="number" value={String(rules.pointsPerDollar)} onChange={(v) => setRules((r) => ({ ...r, pointsPerDollar: Number(v) }))} />
          <TextField id="redemptionRate" label="$ per 100 points" type="number" value={String(rules.redemptionRate)} onChange={(v) => setRules((r) => ({ ...r, redemptionRate: Number(v) }))} />
          <TextField id="silverThreshold" label="Silver threshold" type="number" value={String(rules.tierThresholds.Silver)} onChange={(v) => setRules((r) => ({ ...r, tierThresholds: { ...r.tierThresholds, Silver: Number(v) } }))} />
          <TextField id="goldThreshold" label="Gold threshold" type="number" value={String(rules.tierThresholds.Gold)} onChange={(v) => setRules((r) => ({ ...r, tierThresholds: { ...r.tierThresholds, Gold: Number(v) } }))} />
          <TextField id="platinumThreshold" label="Platinum threshold" type="number" value={String(rules.tierThresholds.Platinum)} onChange={(v) => setRules((r) => ({ ...r, tierThresholds: { ...r.tierThresholds, Platinum: Number(v) } }))} />
        </div>
        <button type="button" onClick={saveRules} disabled={isSaving} className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-4 text-body-sm')}>
          {isSaving ? 'Saving…' : 'Save rules'}
        </button>
      </div>
    </div>
  );
}
