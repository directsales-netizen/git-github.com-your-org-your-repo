'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import { buttonVariants, cardVariants, cn, spacing } from '@/design';
import Modal from '@/components/admin/Modal';
import { TextField } from '@/components/admin/FormFields';

const CONFIRM_PHRASE = 'REDEPLOY';

export default function RedeploySection() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  function openModal() {
    setConfirmText('');
    setError(null);
    setJobId(null);
    setIsOpen(true);
  }

  async function handleRedeploy() {
    setIsSubmitting(true);
    setError(null);
    const response = await adminFetch('/api/admin/redeploy', { method: 'POST' });
    if (!response.ok) {
      setError(await extractAdminErrorMessage(response, 'Unable to trigger a redeploy.'));
      setIsSubmitting(false);
      return;
    }
    const data = (await response.json()) as { jobId?: string };
    setJobId(data.jobId ?? 'triggered');
    setConfirmText('');
    setIsSubmitting(false);
  }

  return (
    <div className={cn(cardVariants.base, 'max-w-2xl border-error/30')}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-error" aria-hidden="true" />
        <div>
          <h2 className="text-h6 font-heading font-semibold text-neutral-white">Redeploy Site</h2>
          <p className="mt-1 text-body-sm font-body text-neutral-silver">
            Triggers a new production deployment via Vercel. This app has no database yet — every serverless instance
            holds its data in memory, so a redeploy resets inventory, orders, customers, and purchase inquiries back
            to their defaults. Only use this if you understand and accept that.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <button type="button" onClick={openModal} className={cn(buttonVariants.danger, spacing.buttonPadding, 'text-body-sm')}>
          Redeploy Site
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm redeploy"
        size="sm"
        footer={
          <>
            <button type="button" onClick={() => setIsOpen(false)} className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRedeploy}
              disabled={confirmText !== CONFIRM_PHRASE || isSubmitting}
              className={cn(buttonVariants.danger, spacing.buttonPadding, 'text-body-sm')}
            >
              {isSubmitting ? 'Triggering…' : 'Redeploy'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-body-sm font-body text-neutral-light-gray">
            This will restart the application and <strong className="text-error">permanently reset all in-memory data</strong> —
            inventory, orders, customers, and pending/approved purchase inquiries — back to their hardcoded defaults.
            This cannot be undone.
          </p>
          <TextField
            id="redeploy-confirm"
            label={`Type ${CONFIRM_PHRASE} to confirm`}
            value={confirmText}
            onChange={setConfirmText}
            placeholder={CONFIRM_PHRASE}
          />
          {error && <p role="alert" className="text-body-sm font-body text-error">{error}</p>}
          {jobId && (
            <p className="text-body-sm font-body text-success">
              Redeploy triggered (job {jobId}). It may take a few minutes to go live.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
