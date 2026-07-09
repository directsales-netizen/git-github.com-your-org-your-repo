import { getAllVisitorRequests } from '@/lib/admin/requests';
import PageHeader from '@/components/admin/PageHeader';
import RequestsClient from './RequestsClient';

export default async function AdminRequestsPage() {
  const requests = await getAllVisitorRequests();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Requests"
        description="Every visitor-generated request — contact form, appointments, live chat escalations, and more — in one inbox."
      />
      <RequestsClient initialRequests={requests} />
    </div>
  );
}
