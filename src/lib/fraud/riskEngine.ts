import type { RiskAssessment, RiskLevel } from '@/types/fraud';
import { isDisposableEmail } from './disposableEmail';
import { isLikelySuspiciousPhone } from './tempPhone';

export interface StripeRiskSignals {
  /** Charge.outcome.risk_level */
  riskLevel?: string;
  /** Charge.outcome.risk_score — only present for accounts with Radar for Fraud Teams; treated as optional. */
  riskScore?: number;
  /** Charge.payment_method_details.card.checks.cvc_check */
  cvcCheck?: string | null;
  avsLine1Check?: string | null;
  avsPostalCheck?: string | null;
  /** Charge.payment_method_details.card.country — used by the caller to compute `cardCountryBlocked` before calling assessRisk(), not read directly here. */
  cardCountry?: string | null;
}

export interface RiskInput {
  email: string;
  phone?: string;
  velocityByEmail: number;
  velocityByIp: number;
  duplicateCount: number;
  ipBlocked: boolean;
  cardCountryBlocked: boolean;
  /** Undefined for PayPal — the Orders API doesn't expose an equivalent AVS/CVC/Radar-risk signal. */
  stripe?: StripeRiskSignals;
}

// Tunable thresholds — the entire policy lives in this one file.
const EXTREME_SCORE_THRESHOLD = 80;
const FLAGGED_SCORE_THRESHOLD = 35;
const EMAIL_VELOCITY_THRESHOLD = 3;
const IP_VELOCITY_THRESHOLD = 5;
const IP_VELOCITY_EXTREME_THRESHOLD = 8;

/**
 * Composite fraud risk score. Only three things ever hard-trigger `extreme`
 * (fulfillment withheld, admin must Approve/Reject): a blocklisted IP, a
 * blocklisted card-issuing country, or Stripe Radar's own 'highest' verdict.
 * Everything else accumulates points toward `flagged` (fulfills normally,
 * just visible in the review queue) — matches "never automatically reject
 * unless risk is extremely high."
 */
export function assessRisk(input: RiskInput): RiskAssessment {
  const reasons: string[] = [];
  let score = 0;
  let hardExtreme = false;

  if (input.ipBlocked) {
    hardExtreme = true;
    reasons.push('IP address is on the blocklist');
  }
  if (input.cardCountryBlocked) {
    hardExtreme = true;
    reasons.push('Card-issuing country is restricted');
  }
  if (input.stripe?.riskLevel === 'highest') {
    hardExtreme = true;
    reasons.push('Stripe Radar flagged this payment as highest risk');
  } else if (input.stripe?.riskLevel === 'elevated') {
    score += 25;
    reasons.push('Stripe Radar flagged this payment as elevated risk');
  }
  if (typeof input.stripe?.riskScore === 'number') {
    score += input.stripe.riskScore * 0.3;
  }

  if (input.stripe?.cvcCheck === 'fail') {
    score += 30;
    reasons.push('CVC check failed');
  } else if (input.stripe?.cvcCheck === 'unavailable') {
    score += 10;
    reasons.push('CVC check unavailable');
  }

  if (input.stripe?.avsLine1Check === 'fail' || input.stripe?.avsPostalCheck === 'fail') {
    score += 20;
    reasons.push('Address verification (AVS) failed');
  } else if (input.stripe?.avsLine1Check === 'unavailable' || input.stripe?.avsPostalCheck === 'unavailable') {
    score += 5;
    reasons.push('Address verification (AVS) unavailable');
  }

  if (input.velocityByEmail > EMAIL_VELOCITY_THRESHOLD) {
    score += 20;
    reasons.push(`${input.velocityByEmail} checkout attempts from this email in the last 15 minutes`);
  }
  if (input.velocityByIp > IP_VELOCITY_THRESHOLD) {
    score += 25;
    reasons.push(`${input.velocityByIp} checkout attempts from this IP in the last 15 minutes`);
  }
  if (input.velocityByIp > IP_VELOCITY_EXTREME_THRESHOLD) {
    hardExtreme = true;
  }

  if (input.duplicateCount > 1) {
    score += 25;
    reasons.push('Matches another recent checkout for the same items and amount');
  }

  if (isDisposableEmail(input.email)) {
    score += 20;
    reasons.push('Email domain is a known disposable/temporary provider');
  }

  if (input.phone && isLikelySuspiciousPhone(input.phone)) {
    score += 15;
    reasons.push('Phone number matches a known fake/placeholder pattern');
  }

  const level: RiskLevel = hardExtreme || score >= EXTREME_SCORE_THRESHOLD ? 'extreme' : score >= FLAGGED_SCORE_THRESHOLD ? 'flagged' : 'low';

  return { score: Math.round(Math.min(100, score)), level, reasons };
}
