'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BusinessSettings } from '@/types/admin';
import { buttonVariants, cardVariants, cn, spacing } from '@/design';
import { TextField, ToggleField } from '@/components/admin/FormFields';

export default function SettingsClient({ initialSettings }: { initialSettings: BusinessSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setIsSaving(true);
    setSaved(false);
    const response = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (response.ok) {
      setSettings(await response.json());
      setSaved(true);
      router.refresh();
    }
    setIsSaving(false);
  }

  return (
    <div className={cn(cardVariants.base, 'max-w-2xl')}>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <TextField id="businessName" label="Business name" value={settings.businessName} onChange={(v) => setSettings((s) => ({ ...s, businessName: v }))} />
        <TextField id="currency" label="Currency" value={settings.currency} onChange={(v) => setSettings((s) => ({ ...s, currency: v }))} />
        <TextField id="supportEmail" label="Support email" type="email" value={settings.supportEmail} onChange={(v) => setSettings((s) => ({ ...s, supportEmail: v }))} />
        <TextField id="supportPhone" label="Support phone" value={settings.supportPhone} onChange={(v) => setSettings((s) => ({ ...s, supportPhone: v }))} />
        <TextField id="businessHours" label="Business hours" value={settings.businessHours} onChange={(v) => setSettings((s) => ({ ...s, businessHours: v }))} />
        <TextField id="taxRatePercent" label="Tax rate (%)" type="number" value={String(settings.taxRatePercent)} onChange={(v) => setSettings((s) => ({ ...s, taxRatePercent: Number(v) }))} />
      </div>
      <div className="mt-4">
        <TextField id="address" label="Business address" value={settings.address} onChange={(v) => setSettings((s) => ({ ...s, address: v }))} />
      </div>
      <div className="mt-4">
        <ToggleField
          id="maintenanceMode"
          label="Maintenance mode"
          description="Displays a maintenance notice to visitors when enabled (display-only in this demo)"
          checked={settings.maintenanceMode}
          onChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button type="button" onClick={save} disabled={isSaving} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
          {isSaving ? 'Saving…' : 'Save settings'}
        </button>
        {saved && <span className="text-caption font-body text-success">Saved.</span>}
      </div>
    </div>
  );
}
