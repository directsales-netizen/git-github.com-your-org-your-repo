'use client';

import { useState } from 'react';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import { useRouter } from 'next/navigation';
import type { BusinessSettings } from '@/types/admin';
import { buttonVariants, cardVariants, cn, spacing } from '@/design';
import { TextField, ToggleField } from '@/components/admin/FormFields';

export default function SettingsClient({ initialSettings }: { initialSettings: BusinessSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setSaved(false);
    setError(null);
    const response = await adminFetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (response.ok) {
      setSettings(await response.json());
      setSaved(true);
      router.refresh();
    } else {
      setError(await extractAdminErrorMessage(response, 'Unable to save settings.'));
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
      <div className="mt-4 flex flex-col gap-4">
        <ToggleField
          id="maintenanceMode"
          label="Maintenance mode"
          description="Replaces the entire public site with a maintenance notice for visitors. Admins stay logged in and can still browse the site normally."
          checked={settings.maintenanceMode}
          onChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
        />
        <ToggleField
          id="requireAccountForCheckout"
          label="Require an account to check out"
          description="When enabled, customers must register/log in before completing checkout — guest checkout is disabled."
          checked={settings.requireAccountForCheckout}
          onChange={(v) => setSettings((s) => ({ ...s, requireAccountForCheckout: v }))}
        />
        <ToggleField
          id="ordersPaused"
          label="Pause order inquiries"
          description="Shows a site-wide notice that ordering is paused and directs customers to email support or the AI assistant instead. Browsing stays open; adding to cart and checkout are blocked. Unlike maintenance mode, the storefront itself stays up."
          checked={settings.ordersPaused}
          onChange={(v) => setSettings((s) => ({ ...s, ordersPaused: v }))}
        />
        <ToggleField
          id="inquiryOnlyMode"
          label="Require purchase approval"
          description="When enabled, customers submit a purchase request instead of paying immediately — a SuperAdmin must approve it in Purchase Inquiries before a payment link is issued. Independent of pausing orders: the cart and checkout form still work, only the payment step is gated."
          checked={settings.inquiryOnlyMode}
          onChange={(v) => setSettings((s) => ({ ...s, inquiryOnlyMode: v }))}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button type="button" onClick={save} disabled={isSaving} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
          {isSaving ? 'Saving…' : 'Save settings'}
        </button>
        {saved && <span className="text-caption font-body text-success">Saved.</span>}
        {error && <span className="text-caption font-body text-error">{error}</span>}
      </div>
    </div>
  );
}
