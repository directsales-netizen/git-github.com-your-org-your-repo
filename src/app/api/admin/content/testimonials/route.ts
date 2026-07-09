import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { addTestimonial } from '@/lib/admin/content';
import type { Testimonial } from '@/types/testimonial';

export async function POST(request: NextRequest) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const body = (await request.json()) as Omit<Testimonial, 'id'>;
  if (!body.name || !body.quote) {
    return NextResponse.json({ error: 'name and quote are required.' }, { status: 400 });
  }

  const testimonial = await addTestimonial(body);
  await logActivity({ actor: session.sub, action: 'create', target: `testimonial from ${testimonial.name}` });

  return NextResponse.json(testimonial, { status: 201 });
}
