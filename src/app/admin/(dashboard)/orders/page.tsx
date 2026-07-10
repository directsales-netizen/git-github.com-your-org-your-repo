import { getAllOrders } from '@/lib/chat/orders';
import { getAllDisputes } from '@/lib/fraud/disputes';
import PageHeader from '@/components/admin/PageHeader';
import OrdersClient from './OrdersClient';

export default async function AdminOrdersPage() {
  const [orders, disputes] = await Promise.all([getAllOrders(), getAllDisputes()]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orders" description="Track, fulfill, and manage orders." />
      <OrdersClient initialOrders={orders} disputes={disputes} />
    </div>
  );
}
