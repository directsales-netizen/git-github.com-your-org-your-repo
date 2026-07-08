import { getCustomerSession } from '@/lib/customer/getSession';
import { getAddressesForEmail } from '@/lib/customer/addresses';
import AddressesClient from './AddressesClient';

export default async function AccountAddressesPage() {
  const session = await getCustomerSession();
  if (!session) return null;

  const addresses = await getAddressesForEmail(session.sub);
  return <AddressesClient initialAddresses={addresses} />;
}
