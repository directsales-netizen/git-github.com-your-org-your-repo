'use client';

import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { SavedAddress } from '@/types/customer';
import { buttonVariants, cardVariants, cn, inputVariants, spacing } from '@/design';

const EMPTY_FORM = { label: '', line1: '', line2: '', city: '', state: '', zip: '' };

export default function AddressesClient({ initialAddresses }: { initialAddresses: SavedAddress[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const response = await fetch('/api/customer/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      const created: SavedAddress = await response.json();
      setAddresses((prev) => [...prev, created]);
      setForm(EMPTY_FORM);
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/customer/addresses/${id}`, { method: 'DELETE' });
    if (response.ok) setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      {addresses.length > 0 && (
        <div className="flex flex-col gap-3">
          {addresses.map((address) => (
            <div key={address.id} className={cn(cardVariants.base, 'flex items-start justify-between gap-4')}>
              <div>
                <p className="font-heading font-semibold text-neutral-white">{address.label}</p>
                <p className="text-body-sm font-body text-neutral-light-gray">
                  {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
                  {address.city}, {address.state} {address.zip}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Delete ${address.label}`}
                onClick={() => handleDelete(address.id)}
                className={cn('rounded-md p-1.5 text-neutral-silver hover:text-error')}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className={cn(cardVariants.base, 'grid grid-cols-1 gap-4 tablet:grid-cols-2')}>
        <div className="tablet:col-span-2">
          <label htmlFor="addr-label" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Label</label>
          <input id="addr-label" required placeholder="Home, Work…" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className={inputVariants.base} />
        </div>
        <div className="tablet:col-span-2">
          <label htmlFor="addr-line1" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Address line 1</label>
          <input id="addr-line1" required value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} className={inputVariants.base} />
        </div>
        <div className="tablet:col-span-2">
          <label htmlFor="addr-line2" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">Address line 2 (optional)</label>
          <input id="addr-line2" value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} className={inputVariants.base} />
        </div>
        <div>
          <label htmlFor="addr-city" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">City</label>
          <input id="addr-city" required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputVariants.base} />
        </div>
        <div>
          <label htmlFor="addr-state" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">State</label>
          <input id="addr-state" required value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className={inputVariants.base} />
        </div>
        <div>
          <label htmlFor="addr-zip" className="mb-1.5 block text-label-md font-body text-neutral-light-gray">ZIP</label>
          <input id="addr-zip" required value={form.zip} onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))} className={inputVariants.base} />
        </div>
        <div className="tablet:col-span-2">
          <button type="submit" disabled={isSubmitting} className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}>
            {isSubmitting ? 'Saving…' : 'Save address'}
          </button>
        </div>
      </form>
    </div>
  );
}
