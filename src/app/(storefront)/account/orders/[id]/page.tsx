import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCustomerSession } from '@/lib/customer/getSession';
import { getOrderForCustomer, ORDER_STATUS_COPY } from '@/lib/chat/orders';
import { getBusinessSettings } from '@/lib/admin/settings';
import { cardVariants, cn, buttonVariants, spacing } from '@/design';
import OrderRequestActions from './OrderRequestActions';

const STATUS_LABEL: Record<string, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default async function AccountOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCustomerSession();
  if (!session) return null;

  const [order, settings] = await Promise.all([getOrderForCustomer(id, session.sub), getBusinessSettings()]);
  if (!order) notFound();

  const total = order.items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/account/orders" className="text-body-sm font-body text-accent-primary hover:underline">← Back to Orders</Link>

      <div className={cn(cardVariants.base, 'flex flex-col gap-3')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-h5 font-heading font-semibold text-neutral-white">Order {order.id}</h2>
          <span className="text-caption font-body text-accent-primary">{STATUS_LABEL[order.status] ?? order.status}</span>
        </div>
        <p className="text-caption font-body text-neutral-silver">{ORDER_STATUS_COPY[order.status]}</p>
        <p className="text-caption font-body text-neutral-silver">Placed {order.placedDate} · Est. delivery {order.estimatedDelivery}</p>

        <ul className="mt-2 flex flex-col gap-1">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between text-body-sm font-body text-neutral-light-gray">
              <span>{item.title} × {item.quantity ?? 1}</span>
              <span>${(item.price * (item.quantity ?? 1)).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-neutral-titanium/10 pt-2 font-heading font-semibold text-neutral-white">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {order.trackingNumber && (
          <p className="text-caption font-body text-neutral-silver">{order.carrier} tracking: {order.trackingNumber}</p>
        )}

        {order.returnStatus !== 'none' && (
          <p className="text-caption font-body text-neutral-silver">Return status: {order.returnStatus}</p>
        )}
        {order.warrantyStatus !== 'none' && (
          <p className="text-caption font-body text-neutral-silver">Warranty status: {order.warrantyStatus}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-3">
          <a href={`/account/orders/${order.id}/invoice`} target="_blank" rel="noreferrer" className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-caption')}>
            Download Invoice
          </a>
          <a href={`/account/orders/${order.id}/receipt`} target="_blank" rel="noreferrer" className={cn(buttonVariants.ghost, spacing.buttonPadding, 'text-caption')}>
            Download Receipt
          </a>
        </div>
      </div>

      <OrderRequestActions orderId={order.id} supportEmail={settings.supportEmail} />
    </div>
  );
}
