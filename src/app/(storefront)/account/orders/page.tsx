import Link from 'next/link';
import { getCustomerSession } from '@/lib/customer/getSession';
import { getOrdersByEmail } from '@/lib/chat/orders';
import { cardVariants, cn } from '@/design';
import EmptyState from '@/components/admin/EmptyState';

const STATUS_LABEL: Record<string, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default async function AccountOrdersPage() {
  const session = await getCustomerSession();
  if (!session) return null;

  const orders = await getOrdersByEmail(session.sub);

  if (orders.length === 0) {
    return <EmptyState title="No orders yet" description="Your order history will show up here once you've made a purchase." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <Link key={order.id} href={`/account/orders/${order.id}`} className={cn(cardVariants.base, 'flex flex-col gap-2 transition-colors duration-300 hover:border-accent-primary/40')}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-heading font-semibold text-neutral-white">Order {order.id}</p>
            <span className="text-caption font-body text-accent-primary">{STATUS_LABEL[order.status] ?? order.status}</span>
          </div>
          <p className="text-caption font-body text-neutral-silver">Placed {order.placedDate} · Est. delivery {order.estimatedDelivery}</p>
          <ul className="mt-2 flex flex-col gap-1">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-body-sm font-body text-neutral-light-gray">
                <span>{item.title}</span>
                <span>${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          {order.trackingNumber && (
            <p className="mt-1 text-caption font-body text-neutral-silver">
              {order.carrier} tracking: {order.trackingNumber}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
