import { getAllOrders } from '@/lib/chat/orders';
import PageHeader from '@/components/admin/PageHeader';
import OrdersClient from './OrdersClient';

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Orders" description="Track and update order status." />
      <OrdersClient initialOrders={orders} />
    </div>
  );
}
