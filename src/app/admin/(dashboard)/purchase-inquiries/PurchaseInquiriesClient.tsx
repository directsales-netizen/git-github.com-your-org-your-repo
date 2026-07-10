'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';
import { adminFetch, extractAdminErrorMessage } from '@/lib/admin/adminFetch';
import type { PurchaseInquiry, PurchaseInquiryStatus } from '@/types/admin';
import { accessibility, buttonVariants, cn, spacing } from '@/design';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge, { type BadgeTone } from '@/components/admin/StatusBadge';
import Drawer from '@/components/admin/Drawer';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import Modal from '@/components/admin/Modal';
import { TextareaField } from '@/components/admin/FormFields';

const STATUS_TONE: Record<PurchaseInquiryStatus, BadgeTone> = {
  pending: 'info',
  approved: 'warning',
  rejected: 'error',
  converted: 'success',
};

const STATUS_LABELS: Record<PurchaseInquiryStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved — Awaiting Payment',
  rejected: 'Rejected',
  converted: 'Paid',
};

const FILTER_TABS: Array<{ value: PurchaseInquiryStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'converted', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
];

export default function PurchaseInquiriesClient({ initialInquiries }: { initialInquiries: PurchaseInquiry[] }) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [filter, setFilter] = useState<PurchaseInquiryStatus | 'all'>('all');
  const [detail, setDetail] = useState<PurchaseInquiry | null>(null);
  const [approveTarget, setApproveTarget] = useState<PurchaseInquiry | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PurchaseInquiry | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => (filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter)), [inquiries, filter]);

  async function patchInquiry(id: string, body: { action: 'approve' } | { action: 'reject'; reason: string }): Promise<PurchaseInquiry | null> {
    const response = await adminFetch(`/api/admin/purchase-inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      setError(await extractAdminErrorMessage(response, `Unable to update ${id}.`));
      return null;
    }
    setError(null);
    const updated: PurchaseInquiry = await response.json();
    setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    router.refresh();
    return updated;
  }

  async function handleApprove() {
    if (!approveTarget) return;
    setIsSaving(true);
    const updated = await patchInquiry(approveTarget.id, { action: 'approve' });
    setApproveTarget(null);
    setIsSaving(false);
    if (updated) setDetail(updated);
  }

  async function handleReject() {
    if (!rejectTarget || !rejectReason.trim()) return;
    setIsSaving(true);
    const updated = await patchInquiry(rejectTarget.id, { action: 'reject', reason: rejectReason.trim() });
    setRejectTarget(null);
    setRejectReason('');
    setIsSaving(false);
    if (updated) setDetail(updated);
  }

  function copyLink(url: string) {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const columns: Column<PurchaseInquiry>[] = [
    { key: 'id', header: 'Reference', sortValue: (i) => i.id, render: (i) => <span className="font-medium text-neutral-white">{i.id}</span> },
    {
      key: 'customer',
      header: 'Customer',
      render: (i) => (
        <div>
          <p className="text-neutral-white">{i.name}</p>
          <p className="text-caption text-neutral-silver">{i.email}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Items',
      render: (i) => (
        <span className="text-body-sm text-neutral-light-gray">
          {i.items.map((item) => `${item.title} × ${item.quantity}`).join(', ')}
        </span>
      ),
    },
    { key: 'subtotal', header: 'Subtotal', sortValue: (i) => i.subtotal, render: (i) => `$${i.subtotal.toFixed(2)}` },
    { key: 'createdAt', header: 'Submitted', sortValue: (i) => i.createdAt, render: (i) => new Date(i.createdAt).toLocaleString() },
    { key: 'status', header: 'Status', render: (i) => <StatusBadge tone={STATUS_TONE[i.status]} label={STATUS_LABELS[i.status]} /> },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-caption font-body font-medium transition-colors',
              accessibility.focusRing,
              filter === tab.value ? 'bg-accent-primary text-bg-primary' : 'bg-bg-secondary text-neutral-silver hover:text-accent-primary'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-body-sm font-body text-error">{error}</p>}

      <div className="mt-4">
        <DataTable
          columns={columns}
          rows={filtered}
          getRowId={(i) => i.id}
          searchable
          searchPlaceholder="Search purchase inquiries…"
          searchKeys={['id', 'name', 'email']}
          emptyMessage="No purchase inquiries yet."
          rowActions={(i) => (
            <button type="button" onClick={() => setDetail(i)} className={cn('rounded-md px-2 py-1 text-caption text-accent-primary hover:underline', accessibility.focusRing)}>
              Review
            </button>
          )}
        />
      </div>

      <Drawer
        isOpen={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.id} — ${STATUS_LABELS[detail.status]}` : ''}
        footer={
          detail && (
            <>
              <button type="button" onClick={() => setDetail(null)} className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}>
                Close
              </button>
              {detail.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => setRejectTarget(detail)}
                    className={cn(buttonVariants.danger, spacing.buttonPadding, 'text-body-sm')}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => setApproveTarget(detail)}
                    className={cn(buttonVariants.primary, spacing.buttonPadding, 'text-body-sm')}
                  >
                    Approve
                  </button>
                </>
              )}
            </>
          )
        }
      >
        {detail && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-label-md font-body text-neutral-light-gray">Items</p>
              <div className="mt-1 flex flex-col gap-1">
                {detail.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-body-sm font-body text-neutral-white">
                    <span>{item.title} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="mt-1 flex justify-between border-t border-neutral-titanium/20 pt-1 font-heading font-semibold text-neutral-white">
                  <span>Subtotal</span>
                  <span>${detail.subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-label-md font-body text-neutral-light-gray">Shipping address</p>
              <p className="mt-1 text-body-sm font-body text-neutral-white">
                {detail.shippingAddress.line1}
                {detail.shippingAddress.line2 && <>, {detail.shippingAddress.line2}</>}
                <br />
                {detail.shippingAddress.city}, {detail.shippingAddress.state} {detail.shippingAddress.zip}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-body-sm font-body text-neutral-light-gray">
              <p><strong className="text-neutral-white">Customer:</strong> {detail.name}</p>
              <p><strong className="text-neutral-white">Email:</strong> {detail.email}</p>
              <p><strong className="text-neutral-white">Submitted:</strong> {new Date(detail.createdAt).toLocaleString()}</p>
              {detail.reviewedAt && <p><strong className="text-neutral-white">Reviewed:</strong> {new Date(detail.reviewedAt).toLocaleString()}</p>}
            </div>

            {detail.status === 'rejected' && detail.rejectionReason && (
              <div>
                <p className="text-label-md font-body text-neutral-light-gray">Rejection reason</p>
                <p className="mt-1 text-body-sm font-body text-error">{detail.rejectionReason}</p>
              </div>
            )}

            {detail.stripeCheckoutUrl && (detail.status === 'approved' || detail.status === 'converted') && (
              <div>
                <p className="text-label-md font-body text-neutral-light-gray">Payment link</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="truncate text-body-sm font-body text-accent-primary">{detail.stripeCheckoutUrl}</p>
                  <button
                    type="button"
                    aria-label="Copy payment link"
                    onClick={() => copyLink(detail.stripeCheckoutUrl!)}
                    className={cn('shrink-0 rounded-md p-1.5 text-neutral-silver hover:text-accent-primary', accessibility.focusRing)}
                  >
                    <Copy size={14} aria-hidden="true" />
                  </button>
                  {copied && <span className="text-caption text-success">Copied</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        isOpen={approveTarget !== null}
        title="Approve purchase inquiry"
        message={`Approve ${approveTarget?.id} and issue a Stripe payment link to ${approveTarget?.email}? This action is only reversible by the customer not completing payment.`}
        confirmLabel={isSaving ? 'Approving…' : 'Approve'}
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

      <Modal
        isOpen={rejectTarget !== null}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason('');
        }}
        title="Reject purchase inquiry"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason('');
              }}
              className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-body-sm')}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={!rejectReason.trim() || isSaving}
              className={cn(buttonVariants.danger, spacing.buttonPadding, 'text-body-sm')}
            >
              {isSaving ? 'Rejecting…' : 'Reject'}
            </button>
          </>
        }
      >
        <TextareaField
          id="reject-reason"
          label="Reason (shown to the customer by email)"
          value={rejectReason}
          onChange={setRejectReason}
          rows={3}
        />
      </Modal>
    </>
  );
}
