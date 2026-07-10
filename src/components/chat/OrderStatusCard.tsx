import { CheckCircle2, Package, Truck, XCircle } from 'lucide-react';
import type { OrderSummary } from '@/types/chat';
import { cardVariants, cn } from '@/design';

const STATUS_ICON: Record<OrderSummary['status'], typeof Package> = {
  processing: Package,
  shipped: Truck,
  'out-for-delivery': Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const STATUS_LABEL: Record<OrderSummary['status'], string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  'out-for-delivery': 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderStatusCard({ order }: { order: OrderSummary }) {
  const Icon = STATUS_ICON[order.status];

  return (
    <div className={cn(cardVariants.minimal, 'bg-bg-primary')}>
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-accent-primary" aria-hidden="true" />
        <span className="text-body-sm font-body font-semibold text-neutral-white">Order {order.id}</span>
        <span className="ml-auto rounded-full bg-accent-primary/10 px-2 py-0.5 text-caption font-body text-accent-primary">
          {STATUS_LABEL[order.status]}
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {order.items.map((item) => (
          <li key={item.title} className="text-caption font-body text-neutral-silver">
            {item.title} — ${item.price}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-caption font-body text-neutral-silver">
        Estimated delivery: {order.estimatedDelivery}
        {order.trackingNumber && ` · Tracking: ${order.trackingNumber} (${order.carrier})`}
      </p>
    </div>
  );
}
