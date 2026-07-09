import { NextResponse, type NextRequest } from 'next/server';
import { requireSuperAdminSessionWithOtp } from '@/lib/admin/getSession';
import { logActivity } from '@/lib/admin/activityLog';
import { updateAppointmentStatus } from '@/lib/chat/appointments';
import type { AppointmentStatus } from '@/types/chat';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireSuperAdminSessionWithOtp();
  if (!session) return response;

  const { id } = await params;
  const { status } = (await request.json()) as { status: AppointmentStatus };
  const appointment = await updateAppointmentStatus(id, status);
  if (!appointment) return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });

  await logActivity({ actor: session.sub, action: 'update status', target: `appointment ${id}`, detail: status });
  return NextResponse.json(appointment);
}
