import { NextResponse, type NextRequest } from 'next/server';
import { requireCustomerSession } from '@/lib/customer/getSession';
import { createAddress, getAddressesForEmail } from '@/lib/customer/addresses';

export async function GET() {
  const { session, response } = await requireCustomerSession();
  if (!session) return response;

  const addresses = await getAddressesForEmail(session.sub);
  return NextResponse.json(addresses);
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireCustomerSession();
  if (!session) return response;

  const body = (await request.json()) as {
    label?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
    isDefault?: boolean;
  };

  if (!body.label || !body.line1 || !body.city || !body.state || !body.zip) {
    return NextResponse.json({ error: 'label, line1, city, state, and zip are required.' }, { status: 400 });
  }

  // email always comes from the verified session, never the request body —
  // a customer can only ever create addresses for themselves.
  const address = await createAddress({
    email: session.sub,
    label: body.label,
    line1: body.line1,
    line2: body.line2,
    city: body.city,
    state: body.state,
    zip: body.zip,
    isDefault: body.isDefault ?? false,
  });

  return NextResponse.json(address, { status: 201 });
}
