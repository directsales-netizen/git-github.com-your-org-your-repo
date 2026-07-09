import { NextResponse, type NextRequest } from 'next/server';
import { requireEditorOrAboveSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { deleteTestimonial, updateTestimonial } from '@/lib/admin/content';
import type { Testimonial } from '@/types/testimonial';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireEditorOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;
  const patch = (await request.json()) as Partial<Omit<Testimonial, 'id'>>;
  const testimonial = await updateTestimonial(id, patch);
  if (!testimonial) return NextResponse.json({ error: 'Testimonial not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'update', target: `testimonial ${id}` });
  return NextResponse.json(testimonial);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireEditorOrAboveSessionWithOtp();
  if (!session) return response;

  const { id } = await params;
  const ok = await deleteTestimonial(id);
  if (!ok) return NextResponse.json({ error: 'Testimonial not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'delete', target: `testimonial ${id}` });
  return NextResponse.json({ ok: true });
}
