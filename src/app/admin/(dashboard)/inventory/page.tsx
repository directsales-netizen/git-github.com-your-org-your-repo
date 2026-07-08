import { getAllProductsAdmin } from '@/lib/api';
import PageHeader from '@/components/admin/PageHeader';
import InventoryClient from './InventoryClient';

export default async function AdminInventoryPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inventory" description="Add, edit, and manage stock across the catalog." />
      <InventoryClient initialProducts={products} />
    </div>
  );
}
