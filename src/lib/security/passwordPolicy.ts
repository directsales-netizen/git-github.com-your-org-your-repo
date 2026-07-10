import type { PasswordPolicy } from '@/types/admin';

/** Pure validator — returns the first violated rule's message, or null if the password satisfies the policy. */
export function validatePasswordAgainstPolicy(password: string, policy: PasswordPolicy): string | null {
  if (password.length < policy.minLength) {
    return `Password must be at least ${policy.minLength} characters.`;
  }
  if (policy.requireNumber && !/[0-9]/.test(password)) {
    return 'Password must include at least one number.';
  }
  if (policy.requireSymbol && !/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include at least one symbol.';
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must include at least one uppercase letter.';
  }
  return null;
}
