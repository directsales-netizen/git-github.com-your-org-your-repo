import { CalendarCheck } from 'lucide-react';
import type { AppointmentSummary } from '@/types/chat';
import { APPOINTMENT_TYPE_LABELS } from '@/lib/chat/appointments';
import { cardVariants, cn } from '@/design';

export default function AppointmentConfirmationCard({ appointment }: { appointment: AppointmentSummary }) {
  return (
    <div className={cn(cardVariants.minimal, 'bg-bg-primary')}>
      <div className="flex items-center gap-2">
        <CalendarCheck size={18} className="text-success" aria-hidden="true" />
        <span className="text-body-sm font-body font-semibold text-neutral-white">
          {APPOINTMENT_TYPE_LABELS[appointment.type]} requested
        </span>
      </div>
      <p className="mt-2 text-caption font-body text-neutral-silver">Reference: {appointment.id}</p>
      <p className="text-caption font-body text-neutral-silver">Window: {appointment.preferredWindow}</p>
      <p className="text-caption font-body text-neutral-silver">Contact: {appointment.contactMethod}</p>
    </div>
  );
}
