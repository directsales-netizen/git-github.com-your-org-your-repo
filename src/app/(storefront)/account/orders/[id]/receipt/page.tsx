import { notFound } from 'next/navigation';
import { getCustomerSession } from '@/lib/customer/getSession';
import { getOrderForCustomer } from '@/lib/chat/orders';
import { getBusinessSettings } from '@/lib/admin/settings';
import PrintButton from '@/components/PrintButton';

const currency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const PROVIDER_LABEL: Record<string, string> = { stripe: 'Card via Stripe', paypal: 'PayPal' };

export default async function CustomerReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getCustomerSession();
  if (!session) return null;

  const [order, settings] = await Promise.all([getOrderForCustomer(id, session.sub), getBusinessSettings()]);
  if (!order) notFound();

  const subtotal = order.items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);
  const refunded = (order.refundedAmount ?? 0) / 100;
  const paid = subtotal - refunded;

  return (
    <div className="mx-auto max-w-xl bg-white p-10 text-black print:p-0">
      <PrintButton />
      <div className="text-center">
        <h1 className="text-2xl font-bold">{settings.businessName}</h1>
        <p className="mt-1 text-sm font-bold uppercase tracking-widest text-neutral-600">Payment Receipt</p>
      </div>

      <div className="mt-8 flex justify-between text-sm">
        <span>Order</span>
        <span className="font-semibold">{order.id}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Date</span>
        <span>{order.placedDate}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Payment method</span>
        <span>{order.paymentProvider ? PROVIDER_LABEL[order.paymentProvider] : 'On record'}</span>
      </div>

      <div className="mt-6 border-t-2 border-black pt-4">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{item.title} × {item.quantity ?? 1}</span>
            <span>{currency(item.price * (item.quantity ?? 1))}</span>
          </div>
        ))}
      </div>

      {refunded > 0 && (
        <div className="mt-2 flex justify-between text-sm text-neutral-600">
          <span>Refunded</span>
          <span>-{currency(refunded)}</span>
        </div>
      )}

      <div className="mt-2 flex justify-between border-t-2 border-black pt-2 text-lg font-bold">
        <span>Amount Paid</span>
        <span>{currency(paid)}</span>
      </div>

      <p className="mt-10 text-center text-xs text-neutral-600">Thank you for your purchase. Reference: {order.id}.</p>
    </div>
  );
}
