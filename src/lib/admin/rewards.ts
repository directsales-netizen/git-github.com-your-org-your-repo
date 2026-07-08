import type { LoyaltyMember, LoyaltyRules } from '@/types/admin';
import { globalBox, globalSingleton } from '@/lib/globalStore';

const MEMBERS = globalSingleton('loyaltyMembers', (): LoyaltyMember[] => [
  { id: 'lm-1', name: 'Jordan Lee', email: 'jordan.lee@example.com', points: 2840, tier: 'Gold', joinedDate: '2025-11-02' },
  { id: 'lm-2', name: 'Devon K.', email: 'devon.k@example.com', points: 640, tier: 'Bronze', joinedDate: '2026-01-14' },
  { id: 'lm-3', name: 'Priya R.', email: 'priya.r@example.com', points: 1080, tier: 'Silver', joinedDate: '2025-09-30' },
  { id: 'lm-4', name: 'Sam T.', email: 'sam.t@example.com', points: 3610, tier: 'Platinum', joinedDate: '2025-07-18' },
]);

const rulesBox = globalBox('loyaltyRules', (): LoyaltyRules => ({
  pointsPerDollar: 1,
  tierThresholds: { Bronze: 0, Silver: 1000, Gold: 2500, Platinum: 3500 },
  redemptionRate: 5, // $5 per 100 points
}));

function resolveTier(points: number, thresholds: LoyaltyRules['tierThresholds']): LoyaltyMember['tier'] {
  if (points >= thresholds.Platinum) return 'Platinum';
  if (points >= thresholds.Gold) return 'Gold';
  if (points >= thresholds.Silver) return 'Silver';
  return 'Bronze';
}

export async function getAllLoyaltyMembers(): Promise<LoyaltyMember[]> {
  return MEMBERS;
}

export async function getLoyaltyRules(): Promise<LoyaltyRules> {
  return rulesBox.current;
}

export async function updateLoyaltyRules(patch: Partial<LoyaltyRules>): Promise<LoyaltyRules> {
  rulesBox.current = { ...rulesBox.current, ...patch };
  for (const member of MEMBERS) member.tier = resolveTier(member.points, rulesBox.current.tierThresholds);
  return rulesBox.current;
}

export async function adjustMemberPoints(id: string, delta: number): Promise<LoyaltyMember | null> {
  const member = MEMBERS.find((m) => m.id === id);
  if (!member) return null;
  member.points = Math.max(0, member.points + delta);
  member.tier = resolveTier(member.points, rulesBox.current.tierThresholds);
  return member;
}

const nextMemberIdBox = globalBox('nextLoyaltyMemberId', () => 100);

export async function getLoyaltyMemberByEmail(email: string): Promise<LoyaltyMember | null> {
  const normalized = email.trim().toLowerCase();
  return MEMBERS.find((m) => m.email.toLowerCase() === normalized) ?? null;
}

export async function findOrCreateLoyaltyMember(email: string, name: string): Promise<LoyaltyMember> {
  const normalized = email.trim().toLowerCase();
  const existing = MEMBERS.find((m) => m.email.toLowerCase() === normalized);
  if (existing) return existing;

  const member: LoyaltyMember = {
    id: `lm-${nextMemberIdBox.current++}`,
    name,
    email,
    points: 0,
    tier: 'Bronze',
    joinedDate: new Date().toISOString().slice(0, 10),
  };
  MEMBERS.push(member);
  return member;
}

/** Awards points for a completed order — creates the member if this is their first purchase. */
export async function awardPointsByEmail(email: string, name: string, dollarAmount: number): Promise<LoyaltyMember> {
  const member = await findOrCreateLoyaltyMember(email, name);
  const pointsEarned = Math.round(dollarAmount * rulesBox.current.pointsPerDollar);
  member.points += pointsEarned;
  member.tier = resolveTier(member.points, rulesBox.current.tierThresholds);
  return member;
}
