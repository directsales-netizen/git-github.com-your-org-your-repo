'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import type { SecuritySettings } from '@/types/admin';
import { buttonVariants, cardVariants, cn, spacing } from '@/design';
import { TextField, TextareaField, ToggleField } from '@/components/admin/FormFields';

function listToText(list: string[]): string {
  return list.join('\n');
}

function textToList(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function SecurityClient({
  initialSettings,
  currentIp,
}: {
  initialSettings: SecuritySettings;
  currentIp: string | null;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [allowListText, setAllowListText] = useState(listToText(initialSettings.ipAllowList));
  const [blockListText, setBlockListText] = useState(listToText(initialSettings.ipBlockList));
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setSaved(false);
    setError(null);

    const patch: SecuritySettings = {
      ...settings,
      ipAllowList: textToList(allowListText),
      ipBlockList: textToList(blockListText),
    };

    const response = await adminFetch('/api/admin/security-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (response.ok) {
      const updated = (await response.json()) as SecuritySettings;
      setSettings(updated);
      setAllowListText(listToText(updated.ipAllowList));
      setBlockListText(listToText(updated.ipBlockList));
      setSaved(true);
      router.refresh();
    } else {
      setError(await extractAdminErrorMessage(response, 'Unable to save security settings.'));
    }
    setIsSaving(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className={cn(cardVariants.base, 'max-w-2xl')}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Password Policy</h2>
        <p className="mt-1 text-body-sm font-body text-neutral-silver">
          Applies the next time a password is set — currently that's only when an invited admin accepts their invite.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <TextField
            id="passwordMinLength"
            label="Minimum length"
            type="number"
            value={String(settings.passwordPolicy.minLength)}
            onChange={(v) => setSettings((s) => ({ ...s, passwordPolicy: { ...s.passwordPolicy, minLength: Number(v) || 0 } }))}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <ToggleField
            id="requireNumber"
            label="Require a number"
            checked={settings.passwordPolicy.requireNumber}
            onChange={(v) => setSettings((s) => ({ ...s, passwordPolicy: { ...s.passwordPolicy, requireNumber: v } }))}
          />
          <ToggleField
            id="requireSymbol"
            label="Require a symbol"
            checked={settings.passwordPolicy.requireSymbol}
            onChange={(v) => setSettings((s) => ({ ...s, passwordPolicy: { ...s.passwordPolicy, requireSymbol: v } }))}
          />
          <ToggleField
            id="requireUppercase"
            label="Require an uppercase letter"
            checked={settings.passwordPolicy.requireUppercase}
            onChange={(v) => setSettings((s) => ({ ...s, passwordPolicy: { ...s.passwordPolicy, requireUppercase: v } }))}
          />
        </div>
      </div>

      <div className={cn(cardVariants.base, 'max-w-2xl')}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Login Restrictions</h2>
        <p className="mt-1 text-body-sm font-body text-neutral-silver">How many failed admin login attempts are allowed before a temporary lockout.</p>
        <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <TextField
            id="maxAttempts"
            label="Max attempts"
            type="number"
            value={String(settings.loginRateLimit.maxAttempts)}
            onChange={(v) => setSettings((s) => ({ ...s, loginRateLimit: { ...s.loginRateLimit, maxAttempts: Number(v) || 0 } }))}
          />
          <TextField
            id="windowMinutes"
            label="Lockout window (minutes)"
            type="number"
            value={String(settings.loginRateLimit.windowMinutes)}
            onChange={(v) => setSettings((s) => ({ ...s, loginRateLimit: { ...s.loginRateLimit, windowMinutes: Number(v) || 0 } }))}
          />
        </div>
      </div>

      <div className={cn(cardVariants.base, 'max-w-2xl')}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Session Expiration</h2>
        <p className="mt-1 text-body-sm font-body text-neutral-silver">
          Applies to newly-issued sessions only — a session already signed in keeps its original expiration.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <TextField
            id="sessionTtlMinutes"
            label="Session timeout (minutes)"
            type="number"
            value={String(settings.sessionTtlMinutes)}
            onChange={(v) => setSettings((s) => ({ ...s, sessionTtlMinutes: Number(v) || 0 }))}
          />
        </div>
      </div>

      <div className={cn(cardVariants.base, 'max-w-2xl')}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">IP Access Control</h2>
        <p className="mt-1 text-body-sm font-body text-neutral-silver">
          One IP or IPv4 CIDR (e.g. <code>203.0.113.0/24</code>) per line. Your current detected IP is{' '}
          <strong className="text-neutral-white">{currentIp ?? 'undetectable in this environment'}</strong>. Saving an allow
          list that doesn't include it, or a block list that does, is rejected — this app has no database, so the only
          recovery from a bad list is a full Redeploy Site, which resets everything back to defaults.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <TextareaField id="ipAllowList" label="Allow list (empty = allow all)" value={allowListText} onChange={setAllowListText} rows={4} />
          <TextareaField id="ipBlockList" label="Block list" value={blockListText} onChange={setBlockListText} rows={4} />
        </div>
      </div>

      <div className={cn(cardVariants.base, 'max-w-2xl')}>
        <h2 className="text-h6 font-heading font-semibold text-neutral-white">Security Alerts</h2>
        <p className="mt-1 text-body-sm font-body text-neutral-silver">
          Email notifications for security-relevant events. Sent via the configured email provider — no-ops silently if
          it isn't set up yet.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <ToggleField
            id="alertOnNewRememberDevice"
            label="Alert on new remembered device"
            description="Emails the signing-in admin when 'Keep me logged in' registers a new device."
            checked={settings.alertOnNewRememberDevice}
            onChange={(v) => setSettings((s) => ({ ...s, alertOnNewRememberDevice: v }))}
          />
          <ToggleField
            id="alertOnRateLimitTripped"
            label="Alert on repeated failed logins"
            description="Emails support when the admin login lockout threshold is hit."
            checked={settings.alertOnRateLimitTripped}
            onChange={(v) => setSettings((s) => ({ ...s, alertOnRateLimitTripped: v }))}
          />
        </div>
        <p className="mt-4 text-body-sm font-body text-neutral-silver">
          Manage remembered devices directly on the{' '}
          <Link href="/admin/sessions" className="text-accent-primary hover:underline">
            Active Sessions
          </Link>{' '}
          page.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={isSaving} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
          {isSaving ? 'Saving…' : 'Save security settings'}
        </button>
        {saved && <span className="text-caption font-body text-success">Saved.</span>}
        {error && <span className="text-caption font-body text-error">{error}</span>}
      </div>
    </div>
  );
}
