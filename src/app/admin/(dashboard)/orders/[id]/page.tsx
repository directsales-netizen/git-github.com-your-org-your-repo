import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/chat/orders';
import { getAllDisputes } from '@/lib/fraud/disputes';
import { getAllVisitorRequests } from '@/lib/admin/requests';
import PageHeader from '@/components/admin/PageHeader';
import OrderDetailClient from './OrderDetailClient';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const [disputes, allRequests] = await Promise.all([getAllDisputes(), getAllVisitorRequests()]);
  const linkedRequests = allRequests.filter((r) => r.orderId === id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Order ${order.id}`} description={`Placed ${order.placedDate} — ${order.email}`} />
      <OrderDetailClient order={order} disputes={disputes} linkedRequests={linkedRequests} />
    </div>
  );
}
