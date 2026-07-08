import { getAllCustomers } from '@/lib/admin/customers';
import PageHeader from '@/components/admin/PageHeader';
import CustomersClient from './CustomersClient';

export default async function AdminCustomersPage() {
  const customers = await getAllCustomers();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" description="View customer activity and manage account status." />
      <CustomersClient initialCustomers={customers} />
    </div>
  );
}
