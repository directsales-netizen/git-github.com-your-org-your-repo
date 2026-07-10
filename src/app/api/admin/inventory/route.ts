import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { createProduct, getAllProductsAdmin, type ProductInput } from '@/lib/api';

export async function GET() {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const products = await getAllProductsAdmin();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const body = (await request.json()) as ProductInput;
  if (!body.title || !body.category || !body.grade || body.price == null || body.stock == null) {
    return NextResponse.json({ error: 'title, category, grade, price, and stock are required.' }, { status: 400 });
  }

  const product = await createProduct(body);
  await logActivity({ actor: session.sub, action: 'create', target: `product ${product.title}` });

  return NextResponse.json(product, { status: 201 });
}
