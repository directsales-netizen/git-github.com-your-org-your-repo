import type { Customer, CustomerStatus } from '@/types/admin';
import { globalSingleton, globalBox } from '@/lib/globalStore';

// Placeholder customer data — same in-memory-array convention as src/lib/api.ts.
const CUSTOMERS = globalSingleton('customers', (): Customer[] => [
  { id: 'cus-1', name: 'Jordan Lee', email: 'jordan.lee@example.com', status: 'active', orders: 3, lifetimeValue: 2847, joinedDate: '2025-11-02', location: 'Austin, TX' },
  { id: 'cus-2', name: 'Devon K.', email: 'devon.k@example.com', status: 'active', orders: 1, lifetimeValue: 649, joinedDate: '2026-01-14', location: 'Portland, OR' },
  { id: 'cus-3', name: 'Priya R.', email: 'priya.r@example.com', status: 'active', orders: 2, lifetimeValue: 1078, joinedDate: '2025-09-30', location: 'Chicago, IL' },
  { id: 'cus-4', name: 'Sam T.', email: 'sam.t@example.com', status: 'active', orders: 4, lifetimeValue: 3612, joinedDate: '2025-07-18', location: 'New York, NY' },
  { id: 'cus-5', name: 'Maria S.', email: 'maria.s@example.com', status: 'blocked', orders: 1, lifetimeValue: 420, joinedDate: '2026-02-08', location: 'Miami, FL' },
  { id: 'cus-6', name: 'Alex Chen', email: 'alex.chen@example.com', status: 'active', orders: 0, lifetimeValue: 0, joinedDate: '2026-06-30', location: 'Seattle, WA' },
]);

export async function getAllCustomers(): Promise<Customer[]> {
  return CUSTOMERS;
}

export async function updateCustomerStatus(id: string, status: CustomerStatus): Promise<Customer | null> {
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) return null;
  customer.status = status;
  return customer;
}

export async function updateCustomer(id: string, patch: Partial<Pick<Customer, 'name' | 'email' | 'location'>>): Promise<Customer | null> {
  const customer = CUSTOMERS.find((c) => c.id === id);
  if (!customer) return null;
  Object.assign(customer, patch);
  return customer;
}

const nextCustomerIdBox = globalBox('nextCrmCustomerId', () => 100);

/**
 * Called from real customer registration and from checkout (guest or
 * signed-in) so the admin Customers page reflects real activity, not just
 * the seeded rows. Dedupes by email — the correlation key shared across
 * customer accounts, rewards, and orders in this no-DB demo app.
 */
export async function addCustomerRecord(input: { name: string; email: string; location?: string }): Promise<Customer> {
  const normalized = input.email.trim().toLowerCase();
  const existing = CUSTOMERS.find((c) => c.email.toLowerCase() === normalized);
  if (existing) return existing;

  const customer: Customer = {
    id: `cus-${nextCustomerIdBox.current++}`,
    name: input.name,
    email: input.email,
    status: 'active',
    orders: 0,
    lifetimeValue: 0,
    joinedDate: new Date().toISOString().slice(0, 10),
    location: input.location ?? '',
  };
  CUSTOMERS.push(customer);
  return customer;
}

export async function recordCustomerOrder(email: string, name: string, amount: number): Promise<Customer> {
  const customer = await addCustomerRecord({ name, email });
  customer.orders += 1;
  customer.lifetimeValue += amount;
  return customer;
}
