import type { AppointmentSummary } from '@/types/chat';

// Placeholder appointment store — resets on server restart, not persisted
// per-user. Ready to be swapped for a real scheduling backend later.
const bookedAppointments: AppointmentSummary[] = [];

function generateReference(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `APT-${digits}`;
}

export async function createAppointment(
  input: Omit<AppointmentSummary, 'id'>
): Promise<AppointmentSummary> {
  const appointment: AppointmentSummary = { id: generateReference(), ...input };
  bookedAppointments.push(appointment);
  return appointment;
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentSummary['type'], string> = {
  repair: 'Repair',
  consultation: 'Consultation',
  callback: 'Callback',
};

export function parseAppointmentType(text: string): AppointmentSummary['type'] | null {
  if (/repair/i.test(text)) return 'repair';
  if (/consult/i.test(text)) return 'consultation';
  if (/call( ?back)?|contact me|reach me/i.test(text)) return 'callback';
  return null;
}
