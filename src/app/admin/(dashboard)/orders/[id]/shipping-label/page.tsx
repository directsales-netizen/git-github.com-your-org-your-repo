import { notFound } from 'next/navigation';
import { getOrderById } from '@/lib/chat/orders';
import { getBusinessSettings } from '@/lib/admin/settings';
import PrintButton from '@/components/PrintButton';

export default async function ShippingLabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrderById(id), getBusinessSettings()]);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-md bg-white p-8 text-black print:p-0">
      <PrintButton />
      <div className="rounded-md border-2 border-black p-6">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-neutral-600">
          Internal Shipping Label — not a purchased carrier label
        </p>

        <div className="mt-4 border-b border-black pb-4">
          <p className="text-xs font-bold uppercase">From</p>
          <p className="text-sm">{settings.businessName}</p>
          <p className="text-sm">{settings.address}</p>
        </div>

        <div className="mt-4 border-b border-black pb-4">
          <p className="text-xs font-bold uppercase">To</p>
          {order.shippingAddress && (
            <>
              <p className="text-sm font-semibold">{order.email}</p>
              <p className="text-sm">
                {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
            </>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs font-bold uppercase">Order</p>
          <p className="text-lg font-bold tracking-wide">{order.id}</p>
          {order.trackingNumber ? (
            <>
              <p className="mt-2 text-xs font-bold uppercase">{order.carrier ?? 'Carrier'} Tracking</p>
              <p className="font-mono text-2xl font-bold tracking-widest">{order.trackingNumber}</p>
            </>
          ) : (
            <p className="mt-2 text-xs text-neutral-600">No tracking number on record yet — add one from the order detail page's Ship action.</p>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-neutral-600">
        Affix to the package for internal handling. This is not a scannable carrier label — purchase and print the
        actual shipping label from your carrier or shipping platform directly.
      </p>
    </div>
  );
}
