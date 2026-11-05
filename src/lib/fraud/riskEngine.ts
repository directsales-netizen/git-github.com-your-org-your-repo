import type { RiskAssessment, RiskLevel } from '@/types/fraud';
import { isDisposableEmail } from './disposableEmail';
import { isLikelySuspiciousPhone } from './tempPhone';

/**
 * Authorize.net's own AVS/CVV result codes from transactionResponse, per
 * createTransactionRequest's documented response shape.
 * avsResultCode: 'Y' full match, 'A'/'W'/'Z' partial match, 'N' no match,
 * 'U'/'R'/'E'/'S'/'G' unavailable/unsupported.
 * cvvResultCode: 'M' match, 'N' no match, 'P'/'S'/'U' not processed/unavailable.
 */
export interface AuthorizeNetRiskSignals {
  avsResultCode?: string;
  cvvResultCode?: string;
}

export interface RiskInput {
  email: string;
  phone?: string;
  velocityByEmail: number;
  velocityByIp: number;
  duplicateCount: number;
  ipBlocked: boolean;
  cardCountryBlocked: boolean;
  authorizeNet?: AuthorizeNetRiskSignals;
}

// Tunable thresholds — the entire policy lives in this one file.
const EXTREME_SCORE_THRESHOLD = 80;
const FLAGGED_SCORE_THRESHOLD = 35;
const EMAIL_VELOCITY_THRESHOLD = 3;
const IP_VELOCITY_THRESHOLD = 5;
const IP_VELOCITY_EXTREME_THRESHOLD = 8;

/**
 * Composite fraud risk score. Only two things ever hard-trigger `extreme`
 * (fulfillment withheld, admin must Approve/Reject): a blocklisted IP or a
 * blocklisted card-issuing country. Everything else accumulates points
 * toward `flagged` (fulfills normally, just visible in the review queue) —
 * matches "never automatically reject unless risk is extremely high."
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

  if (input.authorizeNet?.cvvResultCode === 'N') {
    score += 30;
    reasons.push('CVV check failed');
  } else if (input.authorizeNet?.cvvResultCode === 'P' || input.authorizeNet?.cvvResultCode === 'S' || input.authorizeNet?.cvvResultCode === 'U') {
    score += 10;
    reasons.push('CVV check unavailable');
  }

  if (input.authorizeNet?.avsResultCode === 'N') {
    score += 20;
    reasons.push('Address verification (AVS) failed');
  } else if (input.authorizeNet?.avsResultCode && ['U', 'R', 'E', 'S', 'G'].includes(input.authorizeNet.avsResultCode)) {
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
