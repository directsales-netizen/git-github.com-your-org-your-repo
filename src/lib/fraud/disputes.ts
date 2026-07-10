import type { DisputeRecord, DisputeProvider } from '@/types/fraud';
import { globalSingleton, globalBox } from '@/lib/globalStore';

const DISPUTES = globalSingleton('fraudDisputes', (): DisputeRecord[] => []);
const nextIdBox = globalBox('nextDisputeId', () => 1);

export async function recordDispute(input: {
  provider: DisputeProvider;
  orderId?: string;
  providerReference: string;
  amount?: number;
  status: string;
}): Promise<DisputeRecord> {
  const record: DisputeRecord = {
    id: `dispute-${nextIdBox.current++}`,
    createdAt: new Date().toISOString(),
    ...input,
  };
  DISPUTES.unshift(record);
  return record;
}

export async function getAllDisputes(): Promise<DisputeRecord[]> {
  return DISPUTES;
}
