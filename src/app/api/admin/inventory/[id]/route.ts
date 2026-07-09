import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { deleteProduct, updateProduct, type ProductInput } from '@/lib/api';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;
  const patch = (await request.json()) as Partial<ProductInput>;
  const product = await updateProduct(id, patch);
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  const action = patch.stock !== undefined && Object.keys(patch).length === 1 ? 'adjust stock' : 'update';
  await logActivity({ actor: session.sub, action, target: `product ${product.title}` });

  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;
  const ok = await deleteProduct(id);
  if (!ok) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'delete', target: `product ${id}` });
  return NextResponse.json({ ok: true });
}
