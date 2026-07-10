import { getAllPurchaseInquiries } from '@/lib/checkout/inquiries';
import PageHeader from '@/components/admin/PageHeader';
import PurchaseInquiriesClient from './PurchaseInquiriesClient';

export default async function AdminPurchaseInquiriesPage() {
  const inquiries = await getAllPurchaseInquiries();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Purchase Inquiries"
        description="Customer purchase requests awaiting SuperAdmin review. Approving one issues a real Stripe payment link; rejecting one notifies the customer with a reason."
      />
      <PurchaseInquiriesClient initialInquiries={inquiries} />
    </div>
  );
}
