import Link from 'next/link';
import { getCustomerSession } from '@/lib/customer/getSession';
import { getPurchaseInquiriesByEmail } from '@/lib/checkout/inquiries';
import { buttonVariants, cardVariants, cn, spacing } from '@/design';
import EmptyState from '@/components/admin/EmptyState';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting review',
  approved: 'Approved — payment required',
  rejected: 'Not approved',
  converted: 'Paid',
};

export default async function AccountPurchaseInquiriesPage() {
  const session = await getCustomerSession();
  if (!session) return null;

  const inquiries = await getPurchaseInquiriesByEmail(session.sub);

  if (inquiries.length === 0) {
    return <EmptyState title="No purchase requests yet" description="Submit a purchase request at checkout and its status will show up here." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {inquiries.map((inquiry) => (
        <div key={inquiry.id} className={cn(cardVariants.base, 'flex flex-col gap-2')}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading font-semibold text-neutral-white">Request {inquiry.id}</p>
            <span className="text-caption font-body text-accent-primary">{STATUS_LABEL[inquiry.status] ?? inquiry.status}</span>
          </div>
          <p className="text-caption font-body text-neutral-silver">Submitted {new Date(inquiry.createdAt).toLocaleDateString()}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {inquiry.items.map((item) => (
              <li key={item.productId} className="flex justify-between text-body-sm font-body text-neutral-light-gray">
                <span>{item.title} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          {inquiry.status === 'pending' && (
            <p className="mt-1 text-caption font-body text-neutral-silver">Our team is reviewing your request. We&apos;ll email you once it&apos;s approved.</p>
          )}

          {inquiry.status === 'rejected' && inquiry.rejectionReason && (
            <p className="mt-1 text-caption font-body text-error">{inquiry.rejectionReason}</p>
          )}

          {inquiry.status === 'approved' && inquiry.stripeCheckoutUrl && (
            <a
              href={inquiry.stripeCheckoutUrl}
              className={cn(buttonVariants.primary, spacing.buttonPadding, 'mt-2 self-start text-body-sm')}
            >
              Complete Payment
            </a>
          )}

          {inquiry.status === 'converted' && (
            <Link href="/account/orders" className={cn(buttonVariants.ghost, spacing.buttonPadding, 'mt-2 self-start text-body-sm')}>
              View Order History
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
