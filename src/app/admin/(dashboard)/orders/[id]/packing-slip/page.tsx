import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/chat/orders';
import { getBusinessSettings } from '@/lib/admin/settings';
import PrintButton from '@/components/PrintButton';

export default async function PackingSlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrderById(id), getBusinessSettings()]);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl bg-white p-10 text-black print:p-0">
      <PrintButton />
      <div className="flex items-start justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-2xl font-bold">{settings.businessName}</h1>
          <p className="text-sm">{settings.address}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">Packing Slip</h2>
          <p className="text-sm">Order {order.id}</p>
          <p className="text-sm">{order.placedDate}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wide">Ship To</h3>
        {order.shippingAddress && (
          <p className="mt-1 text-sm">
            {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </p>
        )}
      </div>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Qty</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-neutral-400">
              <td className="py-2">{item.title}</td>
              <td className="py-2 text-right">{item.quantity ?? 1}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {order.customerNotes && (
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wide">Customer Note</h3>
          <p className="mt-1 text-sm">{order.customerNotes}</p>
        </div>
      )}

      <p className="mt-10 text-xs text-neutral-600">No pricing information is shown on packing slips — this document is for fulfillment use only.</p>
    </div>
  );
}
