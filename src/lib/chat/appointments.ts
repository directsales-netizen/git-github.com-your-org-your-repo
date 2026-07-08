import type { AppointmentSummary, AppointmentStatus } from '@/types/chat';
import { globalSingleton } from '@/lib/globalStore';

// Placeholder appointment store — resets on server restart, not persisted
// per-user. Ready to be swapped for a real scheduling backend later.
// Seeded with a few realistic rows so the admin Appointments module has
// something to manage even before any live chat booking has happened.
// Stored via globalSingleton (see src/lib/globalStore.ts) so admin API
// route writes are visible to page reads within the same server process.
const bookedAppointments = globalSingleton('appointments', (): AppointmentSummary[] => [
  {
    id: 'APT-104822',
    type: 'repair',
    preferredWindow: 'Tomorrow morning',
    contactMethod: 'jordan.lee@example.com',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'APT-104910',
    type: 'consultation',
    preferredWindow: 'Friday afternoon',
    contactMethod: '(512) 555-0148',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: 'APT-105033',
    type: 'callback',
    preferredWindow: 'This week, any day',
    contactMethod: 'priya.r@example.com',
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
]);

function generateReference(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `APT-${digits}`;
}

export async function createAppointment(
  input: Omit<AppointmentSummary, 'id' | 'status' | 'createdAt'>
): Promise<AppointmentSummary> {
  const appointment: AppointmentSummary = {
    id: generateReference(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...input,
  };
  bookedAppointments.push(appointment);
  return appointment;
}

export async function getAllAppointments(): Promise<AppointmentSummary[]> {
  return [...bookedAppointments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<AppointmentSummary | null> {
  const appointment = bookedAppointments.find((a) => a.id === id);
  if (!appointment) return null;
  appointment.status = status;
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
