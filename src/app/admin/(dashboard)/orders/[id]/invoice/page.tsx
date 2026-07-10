import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/chat/orders';
import { getBusinessSettings } from '@/lib/admin/settings';
import PrintButton from '@/components/PrintButton';

const currency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrderById(id), getBusinessSettings()]);
  if (!order) notFound();

  const subtotal = order.items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
  const refunded = (order.refundedAmount ?? 0) / 100;

  return (
    <div className="mx-auto max-w-2xl bg-white p-10 text-black print:p-0">
      <PrintButton />
      <div className="flex items-start justify-between border-b-2 border-black pb-4">
        <div>
          <h1 className="text-2xl font-bold">{settings.businessName}</h1>
          <p className="text-sm">{settings.address}</p>
          <p className="text-sm">{settings.supportEmail}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">Invoice</h2>
          <p className="text-sm">Order {order.id}</p>
          <p className="text-sm">{order.placedDate}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide">Billed To</h3>
          <p className="mt-1 text-sm">{order.email}</p>
          {order.shippingAddress && (
            <p className="text-sm">
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            </p>
          )}
        </div>
        <div className="text-right text-sm">
          <p><span className="font-bold">Payment:</span> {order.paymentProvider === 'stripe' ? 'Stripe' : order.paymentProvider === 'paypal' ? 'PayPal' : 'On record'}</p>
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Qty</th>
            <th className="py-2 text-right">Price</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-neutral-400">
              <td className="py-2">{item.title}</td>
              <td className="py-2 text-right">{item.quantity ?? 1}</td>
              <td className="py-2 text-right">{currency(item.price)}</td>
              <td className="py-2 text-right">{currency(item.price * (item.quantity ?? 1))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex flex-col items-end gap-1 text-sm">
        <div className="flex w-48 justify-between">
          <span>Subtotal</span>
          <span>{currency(subtotal)}</span>
        </div>
        {refunded > 0 && (
          <div className="flex w-48 justify-between text-neutral-600">
            <span>Refunded</span>
            <span>-{currency(refunded)}</span>
          </div>
        )}
        <div className="flex w-48 justify-between border-t-2 border-black pt-1 font-bold">
          <span>Total</span>
          <span>{currency(subtotal - refunded)}</span>
        </div>
      </div>

      <p className="mt-10 text-xs text-neutral-600">Reference: {order.id}. Questions about this invoice? Contact {settings.supportEmail}.</p>
    </div>
  );
}
