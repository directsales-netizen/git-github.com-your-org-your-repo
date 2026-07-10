export type RiskLevel = 'low' | 'flagged' | 'extreme';

/**
 * `flagged` = order fulfilled normally, just visible in the review queue.
 * `held` = fulfillment withheld pending admin action (the only "extreme").
 * `cleared`/`blocked` = the admin's Approve/Reject decision on a held order.
 */
export type ReviewStatus = 'none' | 'flagged' | 'held' | 'cleared' | 'blocked';

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  reasons: string[];
}

export interface FraudBlocklists {
  /** IPs that hard-block checkout pre-payment — a deliberate admin decision, not an algorithmic reject. */
  blockedIps: string[];
  /** Card-issuing country codes (ISO 3166-1 alpha-2) that contribute to the risk score post-charge — see riskEngine.ts for why this can't be a pre-auth block from our server. */
  blockedCardCountries: string[];
}

export type DisputeProvider = 'stripe' | 'paypal';

export interface DisputeRecord {
  id: string;
  provider: DisputeProvider;
  /** Our internal order id, when a match could be found via providerReference. */
  orderId?: string;
  providerReference: string;
  amount?: number;
  status: string;
  createdAt: string;
}
